from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import GenericAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, mixins, status
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.contrib.auth import login, logout
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.db import transaction
# serializers:
from .serializers import SignupSerializer, LoginSerializer, RandomQuoteSerializer, DeleteQuoteSerializer, CommunityQuoteSerializer, UserEngagementSerializer
# models:
from .models import User, Quote, CommunityQuote, UserEngagement, QuoteInfo

from .utils import get_delta, update_genre_score

# Auth/user views:
###
class SignupView(APIView):
    queryset = User.objects.all()
    serializer_class = SignupSerializer

    def get(self, request):
        serializer = SignupSerializer()
        return Response(serializer.data)  # show blank structure

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    queryset = User.objects.all()
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user) # set session cookie.

            return Response({'message': 'Login successful'}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@method_decorator(ensure_csrf_cookie, name='dispatch')
class AuthView(APIView):
    def get(self, request):
        if request.user.is_authenticated:
            return JsonResponse({
                'authenticated': True,
                'user': {
                    'id': request.user.id,
                    'username': request.user.username,
                    'email': request.user.email,
                }
            })
        return JsonResponse({'authenticated': False})
    
class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)

  
class RetrieveUsernameView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
            user = request.user
            username = getattr(user, "username", None)
            
            if username:
                return Response({"username": username})
            else:
                return Response({"error": "username not found"}, status=404)
            
###

# Quotes:
###
import random
from django.db.models.functions import Random

class RandomQuoteView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        quote = Quote.objects.order_by(Random()).first()  # One random row only
        if not quote:
            return Response({"error": "No quotes available"}, status=status.HTTP_404_NOT_FOUND)

        serializer = RandomQuoteSerializer(quote)
        return Response(serializer.data, status=status.HTTP_200_OK)

from .serializers import QuoteSearchSerializer
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank
from rest_framework.pagination import LimitOffsetPagination

from rest_framework import generics
from rest_framework.response import Response
from rest_framework.pagination import LimitOffsetPagination
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank
from rest_framework.permissions import IsAuthenticated
from .models import Quote
from .serializers import QuoteSearchSerializer, RandomQuoteSerializer
from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'limit'
    max_page_size = 100

class SearchQuotesView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = QuoteSearchSerializer
    pagination_class = StandardResultsSetPagination
    queryset = Quote.objects.all()

    def get(self, request):
        # validate query params
        serializer = self.get_serializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        q = validated_data.get('q')
        author_filter = validated_data.get('af')
        genre_filter = validated_data.get('gf', [])

        qs = Quote.objects.prefetch_related('info').all()

        # PostgreSQL full-text search
        if q:
            search_vector = (
                SearchVector('quote_text', weight='A') +
                SearchVector('quote_author', weight='B') +
                SearchVector('quote_genre', weight='C') +
                SearchVector('quote_source', weight='D')
            )
            search_query = SearchQuery(q)
            qs = qs.annotate(
                rank=SearchRank(search_vector, search_query)
            ).filter(rank__gte=0.1).order_by('-rank')

        if author_filter:
            qs = qs.filter(quote_author__icontains=author_filter)

        if genre_filter:
            qs = qs.filter(quote_genre__in=genre_filter)

        qs = qs.distinct()

        # Apply pagination
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(qs, request, view=self)

        serializer = RandomQuoteSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

class DeleteQuoteView(GenericAPIView):
    queryset = Quote.objects.all()
    serializer_class = DeleteQuoteSerializer
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if not request.user.is_staff:
            return Response({"error": "Only admins can delete non-community quotes."}, status=status.HTTP_403_FORBIDDEN)

        serializer = DeleteQuoteSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        quote_id = serializer.validated_data['id']
        quote = Quote.objects.filter(id=quote_id).first()
        if not quote:
            return Response({"error": "Quote not found"}, status=status.HTTP_404_NOT_FOUND)

        quote.delete()
        return Response({"success": f"Quote with id {quote_id} deleted."}, status=status.HTTP_200_OK)

class LikeQuoteView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, quote_id):
        user = request.user

        with transaction.atomic(): # atomic -> all block happens or nothing happens
            try:
                quote = Quote.objects.select_for_update().get(id=quote_id)
            except Quote.DoesNotExist:
                return Response({"error": "Quote not found"}, status=status.HTTP_404_NOT_FOUND)

            engagement, _ = UserEngagement.objects.get_or_create(user=user)
            quote_info, _ = QuoteInfo.objects.get_or_create(quote=quote)

            prev_liked = engagement.liked_quotes.filter(id=quote.id).exists()
            prev_disliked = engagement.disliked_quotes.filter(id=quote.id).exists()

            if prev_liked:
                return Response({"error": "User already liked this quote"}, status=status.HTTP_400_BAD_REQUEST)

            if prev_disliked:
                engagement.disliked_quotes.remove(quote)
                if quote_info.downvotes > 0:
                    quote_info.downvotes -= 1
            
            quote_info.upvotes += 1
            quote_info.save()
            engagement.liked_quotes.add(quote)
            
            # --- Update user_profile ---   
            engagement = user.engagement
            genre = quote.quote_genre
            action = "like"
            update_genre_score(engagement=engagement, genre_obj=genre, action=action)

        return Response({
            "success": "Quote liked",
            "likes_count": quote_info.upvotes,
            "dislikes_count": quote_info.downvotes
        }, status=status.HTTP_200_OK)

# endpoint to dislike a quote
class DislikeQuoteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, quote_id):
        user = request.user

        try:
            with transaction.atomic():
                # Lock the quote row for update
                quote = Quote.objects.select_for_update().get(id=quote_id)
                # Ensure QuoteInfo exists and lock it
                quote_info, _ = QuoteInfo.objects.select_for_update().get_or_create(quote=quote)
                engagement, _ = UserEngagement.objects.get_or_create(user=user)

                # Check if user already disliked
                if engagement.disliked_quotes.filter(id=quote.id).exists():
                    return Response({"error": "User already disliked this quote"}, status=400)

                # Remove like if previously liked
                if engagement.liked_quotes.filter(id=quote.id).exists():
                    engagement.liked_quotes.remove(quote)
                    if quote_info.upvotes > 0:
                        quote_info.upvotes -= 1

                # Add dislike
                quote_info.downvotes += 1
                quote_info.save()
                engagement.disliked_quotes.add(quote)

                # --- Update user profile genre score ---
                genre = quote.quote_genre
                update_genre_score(engagement=engagement, genre_obj=genre, action="dislike")

        except Quote.DoesNotExist:
            return Response({"error": "Quote not found"}, status=404)

        return Response({
            "success": "Quote disliked",
            "likes_count": quote_info.upvotes,
            "dislikes_count": quote_info.downvotes
        }, status=200)
    
class UndoQuoteReactionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, action, quote_id):
        user = request.user

        with transaction.atomic():
            # Lock the quote row
            try:
                quote = Quote.objects.select_for_update().get(id=quote_id)
            except Quote.DoesNotExist:
                return Response({"error": "Quote doesn't exist"}, status=404)

            # Lock QuoteInfo row
            quote_info, _ = QuoteInfo.objects.select_for_update().get_or_create(quote=quote)

            # Lock UserEngagement row
            engagement, _ = UserEngagement.objects.select_for_update().get_or_create(user=user)

            if action == "like":
                if not engagement.liked_quotes.filter(id=quote_id).exists():
                    return Response({"error": "User has not liked this quote"}, status=404)

                # undo like
                engagement.liked_quotes.remove(quote)
                if quote_info.upvotes > 0:
                    quote_info.upvotes -= 1
                    quote_info.save()

                # update user profile
                update_genre_score(
                    engagement=engagement,
                    genre_obj=quote.quote_genre,
                    action="undo_like"
                )

                return Response({
                    "success": "Undo like on quote",
                    "likes_count": quote_info.upvotes,
                    "dislikes_count": quote_info.downvotes
                }, status=200)

            elif action == "dislike":
                if not engagement.disliked_quotes.filter(id=quote_id).exists():
                    return Response({"error": "User has not disliked this quote"}, status=404)

                # undo dislike
                engagement.disliked_quotes.remove(quote)
                if quote_info.downvotes > 0:
                    quote_info.downvotes -= 1
                    quote_info.save()

                # update user profile
                update_genre_score(
                    engagement=engagement,
                    genre_obj=quote.quote_genre,
                    action="undo_dislike"
                )

                return Response({
                    "success": "Undo dislike on quote",
                    "likes_count": quote_info.upvotes,
                    "dislikes_count": quote_info.downvotes
                }, status=200)

            return Response({"error": "Unknown action"}, status=400)


class QuoteReactionStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, quote_id):
        user = request.user
        quote = get_object_or_404(Quote, id=quote_id)
        engagement, _ = UserEngagement.objects.get_or_create(user=user)
        
        liked = engagement.liked_quotes.filter(id=quote.id).exists()
        disliked = engagement.disliked_quotes.filter(id=quote.id).exists()
        
        return Response({
            "liked_by_current_user": liked,
            "disliked_by_current_user": disliked
        })

class SaveQuoteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, quote_id):
        try:
            with transaction.atomic():
                # Lock the quote row
                quote_to_save = Quote.objects.select_for_update().get(id=quote_id)

                # Ensure user has an engagement record
                engagement, _ = UserEngagement.objects.select_for_update().get_or_create(user=request.user)

                if engagement.saved_quotes.filter(id=quote_to_save.id).exists():
                    # Already saved → remove (unsave)
                    engagement.saved_quotes.remove(quote_to_save)

                    # --- Update user_profile ---
                    genre = quote_to_save.quote_genre
                    update_genre_score(engagement=engagement, genre_obj=genre, action="undo_save")

                    return Response({"message": "Quote unsaved"}, status=200)
                else:
                    # Not saved yet → save
                    engagement.saved_quotes.add(quote_to_save)

                    # --- Update user_profile ---
                    genre = quote_to_save.quote_genre
                    update_genre_score(engagement=engagement, genre_obj=genre, action="save")

                    return Response({"message": "Quote saved"}, status=200)

        except Quote.DoesNotExist:
            return Response({"error": "Quote not found"}, status=404)

class RetrieveSavedQuotesView(generics.ListAPIView):
    """
    Returns saved quotes for the authenticated user with pagination.
    Uses the same StandardResultsSetPagination as SearchQuotesView.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = RandomQuoteSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        engagement, _ = UserEngagement.objects.get_or_create(user=self.request.user)
        # order by newest first; prefetch related info for efficiency
        return engagement.saved_quotes.all().prefetch_related("info").order_by('-id')


class CopyQuoteView(APIView):
    """
    This view returns nothing, it should just take a post request with the quote id
    increment the copy counter of the quote by one and update the engagement of the user
    then return success response
    """

    def post(self, request, quote_id):
        # do actions with atomic "all actions take place or nothing at all"
        with transaction.atomic():
            # select quoteinfo for update
            quote = get_object_or_404(Quote, id=quote_id)
            # quote is an instance of the model "class" Quote
            # now try to get the info instance of the quote we found:
            quote_info, created = QuoteInfo.objects.select_for_update().get_or_create(
                quote=quote,
                defaults={"copy_count": 0}
            )

            # safe update for the counter under previous lock:
            quote_info.copy_count += 1
            quote_info.save()

            # now work with the engagement of the user:
            quote_genre = quote.quote_genre
            user = request.user
            user_engagement = user.engagement

            update_genre_score(user_engagement, quote_genre, "copy")

            return Response({
                "quote_id": quote_id,
            }) 

###
# Community Quotes:
class CommunityQuoteCreateView(generics.CreateAPIView, GenericAPIView):
    queryset = CommunityQuote.objects.all()
    serializer_class = CommunityQuoteSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(quote_owner=self.request.user)

# ---------------- Retrieve Published Quotes (edited to be paginated + ordered)
class RetrievePublishedQuotes(generics.ListAPIView):
    """
    Returns community/published quotes for the authenticated user (their own community quotes),
    paginated like SearchQuotesView.
    """
    serializer_class = CommunityQuoteSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        user = self.request.user
        # return user's community quotes, newest-first
        return CommunityQuote.objects.filter(quote_owner=user).order_by('-id')

    
class DeleteCommunityQuote(generics.DestroyAPIView):
    serializer_class = CommunityQuoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Ensure the user can only delete their own quotes
        return CommunityQuote.objects.filter(quote_owner=user)
 
# Algorithm views
###
class UserEngagementView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        if not request.user.is_superuser:
            return Response({"error": "Access denied"}, status=403)

        user = get_object_or_404(User, id=user_id)
        engagement = get_object_or_404(UserEngagement, user=user)
        serializer = UserEngagementSerializer(engagement)
        return Response(serializer.data)

    def post(self, request, user_id):
        if not (request.user.is_superuser or request.user.id == user_id):
            return Response({"error": "Access denied."}, status=403)

        user = get_object_or_404(User, id=user_id)
        engagement, created = UserEngagement.objects.get_or_create(user=user)

        genres = request.data.get('genres', [])
        if not isinstance(genres, list):
            return Response({"error": "Genres must be a list."}, status=400)

        existing_genres = engagement.favorite_genres or []
        engagement.favorite_genres = list(set(existing_genres + genres))
        engagement.save()

        return Response({
            "message": f"Genres updated for user {user.username}.",
            "favorite_genres": engagement.favorite_genres
        }, status=200)

###
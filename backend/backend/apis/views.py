from operator import truediv
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
from yaml import serialize

# serializers:
from .serializers import SignupSerializer, LoginSerializer, QuoteSerializer, DeleteQuoteSerializer, \
    CommunityQuoteSerializer, UserEngagementSerializer
# models:
from .models import User, Quote, CommunityQuote, UserEngagement, QuoteInfo, Genre, CommunityQuoteInfo
from rest_framework.exceptions import ValidationError
from .utils import get_delta, update_genre_score
import random
from django.db.models.functions import Random
from .serializers import QuoteSearchSerializer
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.db.models import F, Value, Case, When, FloatField, BooleanField
from django.db.models.functions import Extract, Exp, Ln
from django.db import models


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
            login(request, user)  # set session cookie.

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

class RandomQuoteView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        quote = Quote.objects.order_by(Random()).first()
        if not quote:
            return Response({"error": "No quotes available"}, status=status.HTTP_404_NOT_FOUND)

        # --- EDITED: Pass UserEngagement to context for efficiency ---
        user = request.user
        user_engagement = None
        if user.is_authenticated:
            # Fetch engagement once for the user
            user_engagement, _ = UserEngagement.objects.get_or_create(user=user)

        context = {'request': request, 'user_engagement': user_engagement}
        # -----------------------------------------------------------

        serializer = QuoteSerializer(quote, context=context)
        return Response(serializer.data, status=status.HTTP_200_OK)


from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'limit'
    max_page_size = 100

    def paginate_queryset(self, queryset, request, view=None):
        """
        Override default behavior to avoid running queryset.count().
        """
        self.page_size = self.get_page_size(request)
        if not self.page_size:
            return None

        # Get the current page number from query params (default = 1)
        try:
            self.page_number = int(request.query_params.get(self.page_query_param, 1))
        except (TypeError, ValueError):
            self.page_number = 1

        # Calculate start and end slice indexes
        offset = (self.page_number - 1) * self.page_size
        limit = offset + self.page_size

        # Slice the queryset manually (no count)
        self.results = list(queryset[offset:limit])
        return self.results

    def get_paginated_response(self, data):
        """
        Returns response without total count to avoid COUNT() queries.
        """
        next_page = self.page_number + 1 if len(self.results) == self.page_size else None
        prev_page = self.page_number - 1 if self.page_number > 1 else None

        return Response({
            'next_page': next_page,
            'previous_page': prev_page,
            'results': data,
        })


from rest_framework.views import APIView
# ... (other imports)
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.db.models import F, Value, Case, When, FloatField, BooleanField
from django.db.models.functions import Extract, Exp, Ln
from django.db import models


class SearchQuotesView(ListAPIView):
    """
    Optimized search for quotes.
    Avoids recomputing SearchVector dynamically.
    Filters liked/disliked/saved quotes only within the visible page.
    Selects only necessary fields for speed.
    """
    serializer_class = QuoteSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        query = self.request.query_params.get("q", "").strip()

        qs = (
            Quote.objects
            .prefetch_related("info", "quote_genre")
            .only(
                "id", "quote_text", "quote_author",
                "quote_source", "quote_genre_id"
            )
            .order_by("-id")
        )

        if query:
            qs = qs.filter(search_vector=SearchQuery(query))

        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        # Pagination (Django handles slicing efficiently)
        page = self.paginate_queryset(queryset)
        if page is None:
            return Response({"results": []})

        quotes = list(page)

        # Engagement optimization
        user_engagement = getattr(request.user, "engagement", None)
        liked_ids, disliked_ids, saved_ids = set(), set(), set()

        if user_engagement:
            visible_ids = [q.id for q in quotes]
            liked_ids = set(
                user_engagement.liked_quotes.filter(id__in=visible_ids)
                .values_list("id", flat=True)
            )
            disliked_ids = set(
                user_engagement.disliked_quotes.filter(id__in=visible_ids)
                .values_list("id", flat=True)
            )
            saved_ids = set(
                user_engagement.saved_quotes.filter(id__in=visible_ids)
                .values_list("id", flat=True)
            )

        for q in quotes:
            q.liked_by_user = q.id in liked_ids
            q.disliked_by_user = q.id in disliked_ids
            q.saved_by_user = q.id in saved_ids  # Optional

        # Serialize with the injected flags
        serializer = self.get_serializer(quotes, many=True)
        return self.get_paginated_response(serializer.data)


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

        try:
            with transaction.atomic():
                # Lock quote
                quote = Quote.objects.select_for_update().get(id=quote_id)

                # Lock or create related rows
                quote_info, _ = QuoteInfo.objects.select_for_update().get_or_create(
                    quote=quote,
                    defaults={"upvotes": 0, "downvotes": 0}
                )
                engagement, _ = UserEngagement.objects.select_for_update().get_or_create(user=user)

                # Already liked?
                if engagement.liked_quotes.filter(id=quote.id).exists():
                    return Response({"status": "error", "message": "User already liked this quote"},
                                    status=status.HTTP_400_BAD_REQUEST)

                genre = quote.quote_genre

                # If switching from dislike -> like: undo the dislike first
                if engagement.disliked_quotes.filter(id=quote.id).exists():
                    update_genre_score(engagement=engagement, genre_obj=genre, action="undo_dislike")
                    engagement.disliked_quotes.remove(quote)
                    if quote_info.downvotes > 0:
                        quote_info.downvotes -= 1

                # Apply like
                engagement.liked_quotes.add(quote)
                quote_info.upvotes += 1

                # Persist counters once
                quote_info.save()

                # Update user profile for the new action
                update_genre_score(engagement=engagement, genre_obj=genre, action="like")

        except Quote.DoesNotExist:
            return Response({"status": "error", "message": "Quote not found"},
                            status=status.HTTP_404_NOT_FOUND)

        return Response({
            "status": "success",
            "message": "Quote liked",
            "likes_count": quote_info.upvotes,
            "dislikes_count": quote_info.downvotes
        }, status=status.HTTP_200_OK)


class DislikeQuoteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, quote_id):
        user = request.user

        try:
            with transaction.atomic():
                # Lock quote
                quote = Quote.objects.select_for_update().get(id=quote_id)

                # Lock or create related rows
                quote_info, _ = QuoteInfo.objects.select_for_update().get_or_create(
                    quote=quote,
                    defaults={"upvotes": 0, "downvotes": 0}
                )
                engagement, _ = UserEngagement.objects.select_for_update().get_or_create(user=user)

                # Already disliked?
                if engagement.disliked_quotes.filter(id=quote.id).exists():
                    return Response({"status": "error", "message": "User already disliked this quote"},
                                    status=status.HTTP_400_BAD_REQUEST)

                genre = quote.quote_genre

                # If switching from like -> dislike: undo the like first
                if engagement.liked_quotes.filter(id=quote.id).exists():
                    update_genre_score(engagement=engagement, genre_obj=genre, action="undo_like")
                    engagement.liked_quotes.remove(quote)
                    if quote_info.upvotes > 0:
                        quote_info.upvotes -= 1

                # Apply dislike
                engagement.disliked_quotes.add(quote)
                quote_info.downvotes += 1

                # Persist counters once
                quote_info.save()

                # Update user profile for the new action
                update_genre_score(engagement=engagement, genre_obj=genre, action="dislike")

        except Quote.DoesNotExist:
            return Response({"status": "error", "message": "Quote not found"},
                            status=status.HTTP_404_NOT_FOUND)

        return Response({
            "status": "success",
            "message": "Quote disliked",
            "likes_count": quote_info.upvotes,
            "dislikes_count": quote_info.downvotes
        }, status=status.HTTP_200_OK)

class LikeCommunityQuoteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, quote_id):
        user = request.user

        # Validate quote existence
        quote = CommunityQuote.objects.filter(id=quote_id).first()
        if not quote:
            return Response(
                {"status": "error", "message": "Community Quote not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        with transaction.atomic():
            # Lock info row
            quote_info, _ = CommunityQuoteInfo.objects.select_for_update().get_or_create(
                quote=quote,
                defaults={"upvotes": 0, "downvotes": 0}
            )

            # Lock engagement row
            engagement, _ = UserEngagement.objects.select_for_update().get_or_create(user=user)

            # Already liked?
            if engagement.liked_community_quotes.filter(id=quote.id).exists():
                return Response(
                    {"status": "error", "message": "User already liked this community quote"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Switching from dislike → like
            if engagement.disliked_community_quotes.filter(id=quote.id).exists():
                engagement.disliked_community_quotes.remove(quote)
                if quote_info.downvotes > 0:
                    quote_info.downvotes -= 1

            # Apply like (CORRECT FIELD)
            engagement.liked_community_quotes.add(quote)
            quote_info.upvotes += 1
            quote_info.save()

            return Response({
                "status": "success",
                "message": "Community quote liked",
                "likes_count": quote_info.upvotes,
                "dislikes_count": quote_info.downvotes
            }, status=status.HTTP_200_OK)

class DislikeCommunityQuoteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, quote_id):
        user = request.user

        quote = CommunityQuote.objects.filter(id=quote_id).first()
        if not quote:
            return Response(
                {"status": "error", "message": "Community Quote not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        with transaction.atomic():
            quote_info, _ = CommunityQuoteInfo.objects.select_for_update().get_or_create(
                quote=quote,
                defaults={"upvotes": 0, "downvotes": 0}
            )
            engagement, _ = UserEngagement.objects.select_for_update().get_or_create(user=user)

            if engagement.disliked_community_quotes.filter(id=quote.id).exists():
                return Response(
                    {"status": "error", "message": "User already disliked this community quote"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Undo like if previously liked
            if engagement.liked_community_quotes.filter(id=quote.id).exists():
                engagement.liked_community_quotes.remove(quote)
                if quote_info.upvotes > 0:
                    quote_info.upvotes -= 1

            # Apply dislike
            engagement.disliked_community_quotes.add(quote)
            quote_info.downvotes += 1
            quote_info.save()

        return Response({
            "status": "success",
            "message": "Community quote disliked",
            "likes_count": quote_info.upvotes,
            "dislikes_count": quote_info.downvotes
        }, status=200)

class SaveCommunityQuoteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, quote_id):
        user = request.user

        quote = CommunityQuote.objects.filter(id=quote_id).first()
        if not quote:
            return Response({"error": "Community Quote not found"}, status=404)

        with transaction.atomic():
            engagement, _ = UserEngagement.objects.select_for_update().get_or_create(user=user)

            if engagement.saved_community_quotes.filter(id=quote.id).exists():
                # Already saved → unsave
                engagement.saved_community_quotes.remove(quote)
                return Response({"message": "Community quote unsaved"}, status=200)
            else:
                # Not saved → save
                engagement.saved_community_quotes.add(quote)
                return Response({"message": "Community quote saved"}, status=200)


class UndoCommunityQuoteReactionView(APIView):
    """
    Undo a like or dislike on a community quote.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, action, quote_id):
        user = request.user

        # Validate quote existence
        quote = CommunityQuote.objects.filter(id=quote_id).first()
        if not quote:
            return Response(
                {"status": "error", "message": "Community Quote not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        with transaction.atomic():
            # Lock info row
            quote_info, _ = CommunityQuoteInfo.objects.select_for_update().get_or_create(
                quote=quote,
                defaults={"upvotes": 0, "downvotes": 0}
            )

            # Lock engagement row
            engagement, _ = UserEngagement.objects.select_for_update().get_or_create(user=user)

            if action == "like":
                if not engagement.liked_community_quotes.filter(id=quote_id).exists():
                    return Response(
                        {"status": "error", "message": "User has not liked this community quote"},
                        status=status.HTTP_404_NOT_FOUND
                    )

                # Undo like
                engagement.liked_community_quotes.remove(quote)
                if quote_info.upvotes > 0:
                    quote_info.upvotes -= 1
                quote_info.save()

                return Response({
                    "status": "success",
                    "message": "Undo like on community quote",
                    "likes_count": quote_info.upvotes,
                    "dislikes_count": quote_info.downvotes
                }, status=status.HTTP_200_OK)

            elif action == "dislike":
                if not engagement.disliked_community_quotes.filter(id=quote_id).exists():
                    return Response(
                        {"status": "error", "message": "User has not disliked this community quote"},
                        status=status.HTTP_404_NOT_FOUND
                    )

                # Undo dislike
                engagement.disliked_community_quotes.remove(quote)
                if quote_info.downvotes > 0:
                    quote_info.downvotes -= 1
                quote_info.save()

                return Response({
                    "status": "success",
                    "message": "Undo dislike on community quote",
                    "likes_count": quote_info.upvotes,
                    "dislikes_count": quote_info.downvotes
                }, status=status.HTTP_200_OK)

            else:
                return Response(
                    {"status": "error", "message": "Unknown action"},
                    status=status.HTTP_400_BAD_REQUEST
                )


class UndoQuoteReactionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, action, quote_id):
        user = request.user

        try:
            with transaction.atomic():
                quote = Quote.objects.select_for_update().get(id=quote_id)
                quote_info, _ = QuoteInfo.objects.select_for_update().get_or_create(
                    quote=quote,
                    defaults={"upvotes": 0, "downvotes": 0}
                )
                engagement, _ = UserEngagement.objects.select_for_update().get_or_create(user=user)

                genre = quote.quote_genre

                if action == "like":
                    if not engagement.liked_quotes.filter(id=quote_id).exists():
                        return Response({"status": "error", "message": "User has not liked this quote"},
                                        status=status.HTTP_404_NOT_FOUND)

                    # Undo like
                    update_genre_score(engagement=engagement, genre_obj=genre, action="undo_like")
                    engagement.liked_quotes.remove(quote)
                    if quote_info.upvotes > 0:
                        quote_info.upvotes -= 1
                    quote_info.save()

                    return Response({
                        "status": "success",
                        "message": "Undo like on quote",
                        "likes_count": quote_info.upvotes,
                        "dislikes_count": quote_info.downvotes
                    }, status=status.HTTP_200_OK)

                elif action == "dislike":
                    if not engagement.disliked_quotes.filter(id=quote_id).exists():
                        return Response({"status": "error", "message": "User has not disliked this quote"},
                                        status=status.HTTP_404_NOT_FOUND)

                    # Undo dislike
                    update_genre_score(engagement=engagement, genre_obj=genre, action="undo_dislike")
                    engagement.disliked_quotes.remove(quote)
                    if quote_info.downvotes > 0:
                        quote_info.downvotes -= 1
                    quote_info.save()

                    return Response({
                        "status": "success",
                        "message": "Undo dislike on quote",
                        "likes_count": quote_info.upvotes,
                        "dislikes_count": quote_info.downvotes
                    }, status=status.HTTP_200_OK)

                return Response({"status": "error", "message": "Unknown action"}, status=status.HTTP_400_BAD_REQUEST)

        except Quote.DoesNotExist:
            return Response({"status": "error", "message": "Quote doesn't exist"}, status=status.HTTP_404_NOT_FOUND)


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


class BaseQuoteListView(generics.ListAPIView):
    """Base class to add context pre-fetching for all QuoteSerializer lists."""
    permission_classes = [IsAuthenticated]
    serializer_class = QuoteSerializer
    pagination_class = StandardResultsSetPagination

    def get_serializer_context(self):
        context = super().get_serializer_context()
        user = self.request.user
        user_engagement = None
        if user.is_authenticated:
            # Fetch engagement once per request
            user_engagement, _ = UserEngagement.objects.get_or_create(user=user)
        context['user_engagement'] = user_engagement
        return context

class RetrieveSavedQuotesView(BaseQuoteListView):
    """Returns saved quotes (normal + community) for the authenticated user with pagination."""

    def get_queryset(self):
        engagement, _ = UserEngagement.objects.get_or_create(user=self.request.user)
        return list(
            engagement.saved_quotes.all().prefetch_related("info").order_by("-id")
        ) + list(
            engagement.saved_community_quotes.all().prefetch_related("info").order_by("-id")
        )

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is None:
            return Response({"results": []})

        quotes = list(page)
        visible_ids = [q.id for q in quotes]
        engagement = request.user.engagement

        liked_ids = set(
            list(engagement.liked_quotes.filter(id__in=visible_ids).values_list("id", flat=True)) +
            list(engagement.liked_community_quotes.filter(id__in=visible_ids).values_list("id", flat=True))
        )
        disliked_ids = set(
            list(engagement.disliked_quotes.filter(id__in=visible_ids).values_list("id", flat=True)) +
            list(engagement.disliked_community_quotes.filter(id__in=visible_ids).values_list("id", flat=True))
        )
        saved_ids = set(
            list(engagement.saved_quotes.filter(id__in=visible_ids).values_list("id", flat=True)) +
            list(engagement.saved_community_quotes.filter(id__in=visible_ids).values_list("id", flat=True))
        )

        for q in quotes:
            q.liked_by_user = q.id in liked_ids
            q.disliked_by_user = q.id in disliked_ids
            q.saved_by_user = True

        # Serialize each quote with the correct serializer
        data = [
            CommunityQuoteSerializer(q, context=self.get_serializer_context()).data
            if isinstance(q, CommunityQuote)
            else QuoteSerializer(q, context=self.get_serializer_context()).data
            for q in quotes
        ]

        return self.get_paginated_response(data)


class RetrieveLikedQuotesView(BaseQuoteListView):
    """Returns liked quotes (normal + community) for the authenticated user."""

    def get_queryset(self):
        engagement, _ = UserEngagement.objects.get_or_create(user=self.request.user)
        return list(
            engagement.liked_quotes.all().prefetch_related("info").order_by("-id")
        ) + list(
            engagement.liked_community_quotes.all().prefetch_related("info").order_by("-id")
        )

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is None:
            return Response({"results": []})

        quotes = list(page)
        visible_ids = [q.id for q in quotes]
        engagement = request.user.engagement

        liked_ids = set(
            list(engagement.liked_quotes.filter(id__in=visible_ids).values_list("id", flat=True)) +
            list(engagement.liked_community_quotes.filter(id__in=visible_ids).values_list("id", flat=True))
        )
        disliked_ids = set(
            list(engagement.disliked_quotes.filter(id__in=visible_ids).values_list("id", flat=True)) +
            list(engagement.disliked_community_quotes.filter(id__in=visible_ids).values_list("id", flat=True))
        )
        saved_ids = set(
            list(engagement.saved_quotes.filter(id__in=visible_ids).values_list("id", flat=True)) +
            list(engagement.saved_community_quotes.filter(id__in=visible_ids).values_list("id", flat=True))
        )

        for q in quotes:
            q.liked_by_user = q.id in liked_ids
            q.disliked_by_user = q.id in disliked_ids
            q.saved_by_user = q.id in saved_ids

        data = [
            CommunityQuoteSerializer(q, context=self.get_serializer_context()).data
            if isinstance(q, CommunityQuote)
            else QuoteSerializer(q, context=self.get_serializer_context()).data
            for q in quotes
        ]

        return self.get_paginated_response(data)


class RetrieveDisLikedQuotesView(BaseQuoteListView):
    """Returns disliked quotes (normal + community) for the authenticated user."""

    def get_queryset(self):
        engagement, _ = UserEngagement.objects.get_or_create(user=self.request.user)
        return list(
            engagement.disliked_quotes.all().prefetch_related("info").order_by("-id")
        ) + list(
            engagement.disliked_community_quotes.all().prefetch_related("info").order_by("-id")
        )

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is None:
            return Response({"results": []})

        quotes = list(page)
        visible_ids = [q.id for q in quotes]
        engagement = request.user.engagement

        liked_ids = set(
            list(engagement.liked_quotes.filter(id__in=visible_ids).values_list("id", flat=True)) +
            list(engagement.liked_community_quotes.filter(id__in=visible_ids).values_list("id", flat=True))
        )
        disliked_ids = set(
            list(engagement.disliked_quotes.filter(id__in=visible_ids).values_list("id", flat=True)) +
            list(engagement.disliked_community_quotes.filter(id__in=visible_ids).values_list("id", flat=True))
        )
        saved_ids = set(
            list(engagement.saved_quotes.filter(id__in=visible_ids).values_list("id", flat=True)) +
            list(engagement.saved_community_quotes.filter(id__in=visible_ids).values_list("id", flat=True))
        )

        for q in quotes:
            q.liked_by_user = q.id in liked_ids
            q.disliked_by_user = q.id in disliked_ids
            q.saved_by_user = q.id in saved_ids

        data = [
            CommunityQuoteSerializer(q, context=self.get_serializer_context()).data
            if isinstance(q, CommunityQuote)
            else QuoteSerializer(q, context=self.get_serializer_context()).data
            for q in quotes
        ]

        return self.get_paginated_response(data)

class CopyQuoteView(APIView):
    """
    This view returns nothing, it should just take a post request with the quote id
    increment the copy counter of the quote by one and update the engagement of the user
    then return success response
    """
    permission_classes = [IsAuthenticated]

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
            # Assuming 'user.engagement' is the correct related name for UserEngagement
            # If not, use: user_engagement = UserEngagement.objects.get(user=user)
            user_engagement = user.userengagement

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
        # genre could not be submitted by user:
        genre: str = self.request.data.get("quote_genre")
        if (genre != ""):
            raise ValidationError({"genre": f"Unrecognized parameter."})
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


class RetrievePublishedQuoteCountView(APIView):
    """
    Returns the total count of CommunityQuotes published by the logged-in user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # 1. Filter CommunityQuote objects by the current user
        # 2. Use .count() to get the total number directly from the database
        count = CommunityQuote.objects.filter(quote_owner=user).count()

        return Response({
            "published_quote_count": count
        }, status=status.HTTP_200_OK)


class ShuffledCommunityQuotesView(generics.ListAPIView):
    """
    Returns a paginated list of all Community Quotes, shuffled randomly.
    This view includes user engagement flags (liked/disliked/saved) if the CommunityQuote
    model is linked to the Quote model (which it is assumed to be, or the serializer handles it).
    """

    serializer_class = CommunityQuoteSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        # 1. Target the CommunityQuote model as intended by the class name.
        queryset = (
            CommunityQuote.objects
            # Prefetching/Selecting related data on CommunityQuote depends on its foreign keys.
            # Assuming CommunityQuote has links similar to Quote for optimal retrieval.
            # If CommunityQuote links to a Quote object, you'd select that.
            # For simplicity, we just order by Random() here.
            .all()
        )

        # 2. Shuffle the quotes using Random() function.
        return queryset.order_by(models.functions.Random())

    def list(self, request, *args, **kwargs):
        # Apply pagination to the randomized queryset
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)

        if page is None:
            return Response({"results": []})

        quotes = list(page)

        # --- Engagement Optimization (Injecting User Flags) ---
        user = self.request.user
        # Retrieve or create UserEngagement for the current user
        engagement, _ = UserEngagement.objects.get_or_create(user=user)

        visible_ids = [q.id for q in quotes]

        # --- Serialization ---
        serializer = self.get_serializer(quotes, many=True)
        return self.get_paginated_response(serializer.data)


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


class RetrieveQuoteGenres(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        genres = list(Genre.objects.values_list("name", flat=True))
        return Response(genres)

class FeedView(APIView):
    """
    Infinite feed with modular scoring:
    - genre boost
    - popularity boost
    - recency decay
    - unseen boost
    - interaction penalty (liked/disliked)
    - jitter
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        engagement, _ = UserEngagement.objects.get_or_create(user=user)

        # --- Pagination ---
        limit = int(request.query_params.get("limit", 20))
        limit = min(limit, 100)

        cursor_score = request.query_params.get("cursor_score")
        cursor_id = request.query_params.get("cursor_id")

        # --- User genres ---
        user_genres = engagement.user_profile or {}

        genre_cases = [
            When(quote_genre__name=g, then=Value(score))
            for g, score in user_genres.items()
        ]

        genre_score = Case(
            *genre_cases, default=Value(0.0), output_field=FloatField()
        )

        # --- Lists for penalties ---
        liked_qs = engagement.liked_quotes.values_list("id", flat=True)
        disliked_qs = engagement.disliked_quotes.values_list("id", flat=True)
        seen_qs = engagement.seen_quotes.values_list("id", flat=True) \
            if hasattr(engagement, "seen_quotes") else []

        # --- Base Query ---
        queryset = Quote.objects.select_related("quote_genre").prefetch_related("info")

        # --- Annotate scoring ---
        queryset = queryset.annotate(

            # 1. Genre preference (weighted)
            genre_weight=genre_score * 0.6,

            # 2. Popularity score
            popularity_score=Case(
                When(info__isnull=True, then=Value(0.0)),
                default=(F("info__upvotes") - F("info__downvotes")) * 0.15,
                output_field=FloatField()
            ),

            # 3. Recency score (decays)
            days_old=Extract("created_at", "epoch") / 86400.0,
            current_days=Value(timezone.now().timestamp() / 86400.0),
            age_in_days=F("current_days") - F("days_old"),
            recency_score=Case(
                When(age_in_days__lte=0, then=Value(0.2)),
                default=0.2 * Exp(-1 * F("age_in_days") / 7.0),
                output_field=FloatField()
            ),

            # 4. UNSEEN BOOST
            unseen_boost=Case(
                When(id__in=seen_qs, then=Value(0.0)),
                default=Value(0.4),         # big boost for new content
                output_field=FloatField()
            ),

            # 5. Interaction penalty
            interaction_penalty=Case(
                When(id__in=liked_qs, then=Value(-5.0)),
                When(id__in=disliked_qs, then=Value(-10.0)),
                default=Value(0.0),
                output_field=FloatField()
            ),

            # 6. Random jitter
            jitter=Random() * 0.05,

            # 7. Final score
            final_score=(
                F("genre_weight")
                + F("popularity_score")
                + F("recency_score")
                + F("unseen_boost")
                + F("interaction_penalty")
                + F("jitter")
            )
        )

        # --- Cursor filtering ---
        if cursor_score and cursor_id:
            cursor_score = float(cursor_score)
            cursor_id = int(cursor_id)

            queryset = queryset.filter(
                Q(final_score__lt=cursor_score)
                | Q(final_score=cursor_score, id__lt=cursor_id)
            )

        # --- Order & Limit ---
        queryset = queryset.order_by("-final_score", "-id")[:limit + 1]
        quotes_list = list(queryset)
        has_more = len(quotes_list) > limit

        if has_more:
            quotes_list = quotes_list[:limit]

        # --- Next cursor ---
        next_cursor = None
        if has_more and quotes_list:
            last = quotes_list[-1]
            next_cursor = {
                "cursor_score": float(last.final_score),
                "cursor_id": last.id,
            }

        # --- Engagement flags for frontend ---
        visible_ids = [q.id for q in quotes_list]
        liked_ids = set(engagement.liked_quotes.filter(id__in=visible_ids).values_list("id", flat=True))
        disliked_ids = set(engagement.disliked_quotes.filter(id__in=visible_ids).values_list("id", flat=True))
        saved_ids = set(engagement.saved_quotes.filter(id__in=visible_ids).values_list("id", flat=True))

        for q in quotes_list:
            q.liked_by_user = q.id in liked_ids
            q.disliked_by_user = q.id in disliked_ids
            q.saved_by_user = q.id in saved_ids

        # --- Serialize ---
        serializer = QuoteSerializer(quotes_list, many=True)

        return Response({
            "results": serializer.data,
            "next_cursor": next_cursor,
            "has_more": has_more
        })
###
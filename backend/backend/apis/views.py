from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, mixins, status
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.contrib.auth import login, logout
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.db.models import Q
# serializers:
from .serializers import SignupSerializer, LoginSerializer, RandomQuoteSerializer, DeleteQuoteSerializer, CommunityQuoteSerializer, UserEngagementSerializer
# models:
from .models import User, Quote, CommunityQuote, UserEngagement

# Auth views:
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

###

# Quotes:
###
import random
from django.db.models.functions import Random

class RandomQuoteView(APIView):
    def get(self, request):
        quote = Quote.objects.order_by(Random()).first()  # One random row only
        if not quote:
            return Response({"error": "No quotes available"}, status=status.HTTP_404_NOT_FOUND)

        serializer = RandomQuoteSerializer(quote)
        return Response(serializer.data, status=status.HTTP_200_OK)

from .serializers import QuoteSearchSerializer

class SearchQuotesView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = QuoteSearchSerializer

    def get(self, request):
        serializer = self.get_serializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        q = validated_data.get('q')
        author_filter = validated_data.get('af')
        genre_filter = validated_data.get('gf', [])

        qs = Quote.objects.all()

        if q:
            qs = qs.filter(
                Q(quote_text__icontains=q) |
                Q(quote_author__icontains=q) |
                Q(quote_genre__icontains=q) |
                Q(quote_source__icontains=q)
            )

        if author_filter:
            qs = qs.filter(quote_author__icontains=author_filter)
        
        if genre_filter:
            qs = qs.filter(quote_genre__in=genre_filter)

        qs = qs.distinct()
        count = qs.count()

        serializer = RandomQuoteSerializer(qs, many=True)
        return Response({'count': count, 'results': serializer.data})


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

###

# Community Quotes:
class CommunityQuoteCreateView(mixins.CreateModelMixin,
                                generics.GenericAPIView):
    queryset = CommunityQuote.objects.all()
    serializer_class = CommunityQuoteSerializer

    def post(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
        return self.create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(quote_owner=self.request.user)


class CommunityQuoteDetailView(mixins.RetrieveModelMixin,
                                mixins.UpdateModelMixin,
                                mixins.DestroyModelMixin,
                                generics.GenericAPIView):
    queryset = CommunityQuote.objects.all()
    serializer_class = CommunityQuoteSerializer

    def custom_auth(self, request):
        if not request.user.is_authenticated:
            return Response({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)

        instance = self.get_object()

        if instance.quote_owner.id != request.user.id:
            return Response({"error": "You are not allowed to modify this quote."},
                            status=status.HTTP_403_FORBIDDEN)

        return None

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        auth_response = self.custom_auth(request)
        if auth_response:
            return auth_response
        return self.update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        auth_response = self.custom_auth(request)
        if auth_response:
            return auth_response
        return self.destroy(request, *args, **kwargs)
    
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
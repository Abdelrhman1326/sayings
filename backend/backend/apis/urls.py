from django.urls import path
from .views import SignupView, LoginView, AuthView, LogoutView, LikeCommunityQuoteView, DislikeCommunityQuoteView, \
    SaveCommunityQuoteView, UndoCommunityQuoteReactionView
from .views import RandomQuoteView, SearchQuotesView , DeleteQuoteView, CommunityQuoteCreateView, RetrievePublishedQuotes, DeleteCommunityQuote, RetrieveQuoteGenres
from .views import LikeQuoteView, DislikeQuoteView, UndoQuoteReactionView, QuoteReactionStatusView, SaveQuoteView, RetrieveSavedQuotesView, RetrieveLikedQuotesView, RetrieveDisLikedQuotesView, RetrieveUsernameView, CopyQuoteView
from .views import FeedView, UserEngagementView, RetrievePublishedQuoteCountView, ShuffledCommunityQuotesView

urlpatterns = [
    # Auth / User
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('auth/', AuthView.as_view(), name='auth'),
    path('users/engagement/<int:user_id>/', UserEngagementView.as_view(), name='user-engagement'),
    path('users/username/', RetrieveUsernameView.as_view(), name='retrieve-username'),
    path('users/published/count/', RetrievePublishedQuoteCountView.as_view(), name='published-quote-count'),

    # Community Quotes
    path('community_quotes/publish/', CommunityQuoteCreateView.as_view(), name='community-quote-create'),
    path('community_quotes/published/', RetrievePublishedQuotes.as_view(), name='community-quote-list-published'),
    path('community_quotes/delete/<int:pk>/', DeleteCommunityQuote.as_view(), name='delete-community-quote'),
    path('community_quotes/community/', ShuffledCommunityQuotesView.as_view(), name='community'),
    path('community_quotes/<int:quote_id>/like/', LikeCommunityQuoteView.as_view(), name='like-community-quote'),
    path('community_quotes/<int:quote_id>/dislike/', DislikeCommunityQuoteView.as_view(), name='dislike-community-quote'),
    path('community_quotes/<int:quote_id>/save/', SaveCommunityQuoteView.as_view(), name='save-community-quote'),
    path('community_quotes/undo/<str:action>/<int:quote_id>/', UndoCommunityQuoteReactionView.as_view()),

    # Quotes
    path('quotes/search_quotes/', SearchQuotesView.as_view(), name='search_quotes'),
    path('quotes/<int:quote_id>/like/', LikeQuoteView.as_view(), name='like-quote'),
    path('quotes/<int:quote_id>/dislike/', DislikeQuoteView.as_view(), name='dislike-quote'),
    path('quotes/undo/<str:action>/<int:quote_id>/', UndoQuoteReactionView.as_view(), name='undo-quote-reaction'),
    path('quotes/<int:quote_id>/reaction-status/', QuoteReactionStatusView.as_view(), name='quote-reaction-status'),
    path('quotes/save_quote/<int:quote_id>/', SaveQuoteView.as_view(), name='save_quote'),
    path('quotes/copy_quote/<int:quote_id>/', CopyQuoteView.as_view(), name='copy_quote'),
    path('quotes/delete/', DeleteQuoteView.as_view(), name='delete_quote'),
    path('quotes/saved_quotes/', RetrieveSavedQuotesView.as_view(), name='saved_quotes'),
    path('quotes/liked_quotes/', RetrieveLikedQuotesView.as_view(), name="liked_quotes"),
    path('quotes/disliked_quotes/', RetrieveDisLikedQuotesView.as_view(), name="disliked_quotes"),
    path('quotes/random_quote/', RandomQuoteView.as_view(), name='random_quote'),
    path('quotes/listgenres/', RetrieveQuoteGenres.as_view(), name='list-genres'),
    path('quotes/feed/', FeedView.as_view(), name='quotes-feed'),
]
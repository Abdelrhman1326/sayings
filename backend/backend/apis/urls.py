from django.urls import path
from .views import SignupView, LoginView, AuthView, LogoutView
from .views import RandomQuoteView, SearchQuotesView , DeleteQuoteView, CommunityQuoteCreateView, CommunityQuoteDetailView
from .views import UserEngagementView, LikeQuoteView, DislikeQuoteView, UndoQuoteReactionView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('auth/', AuthView.as_view(), name='auth'),

    path('community_quotes/', CommunityQuoteCreateView.as_view(), name='community-quote-create'),
    path('community_quotes/<int:pk>/', CommunityQuoteDetailView.as_view(), name='community-quote-detail'),
    path('search_quotes/', SearchQuotesView.as_view(), name='search_quotes'),
    path('delete_quote/', DeleteQuoteView.as_view(), name='delete_quote'),
    path('random_quote/', RandomQuoteView.as_view(), name='random_quote'),

    path('user_engagement/<int:user_id>/', UserEngagementView.as_view(), name='user-engagement'),
    path('quotes/<int:quote_id>/like/', LikeQuoteView.as_view(), name='like-quote'),
    path('quotes/<int:quote_id>/dislike/', DislikeQuoteView.as_view(), name='dislike-quote'),
    path('quotes/undo/<str:action>/<int:quote_id>/', UndoQuoteReactionView.as_view(), name='undo-quote-reaction')
]
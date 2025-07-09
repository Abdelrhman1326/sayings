from django.urls import path
from .views import SignupView, LoginView, AuthView, LogoutView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('auth/', AuthView.as_view(), name='auth'),
    path('logout/', LogoutView.as_view(), name='logout'),
]

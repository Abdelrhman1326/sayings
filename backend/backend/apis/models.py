from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    created = models.DateTimeField(auto_now_add=True)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField()
    password = models.CharField(max_length=128)  # Store hashed password only!

class Quote(models.Model):
    quote_text = models.TextField(unique=True) # This enforces uniqueness at the DB level
    quote_genre = models.CharField(max_length=100, blank=True, null=True)
    quote_author = models.CharField(max_length=100, blank=True, null=True)
    quote_source = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.quote_text
    
class QuoteInfo(models.Model):
    quote = models.OneToOneField(Quote, on_delete=models.CASCADE, related_name="info")
    upvotes = models.PositiveIntegerField(default=0)
    downvotes = models.PositiveIntegerField(default=0)
    copy_count = models.PositiveIntegerField(default=0)

class CommunityQuote(models.Model):
    quote_owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='community_quotes')
    quote_text = models.TextField()
    quote_genre = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.quote_text
    
class UserEngagement(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='engagement')
    favorite_genres = models.JSONField(default=list, blank=True)

    liked_quotes = models.ManyToManyField(Quote, related_name="liked_by", blank=True)
    disliked_quotes = models.ManyToManyField(Quote, related_name="disliked_by", blank=True)

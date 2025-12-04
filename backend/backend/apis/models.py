from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    created = models.DateTimeField(auto_now_add=True)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField()
    password = models.CharField(max_length=128)  # Store hashed password only!

class UserInfo(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="info")
    following = models.ManyToManyField("self", symmetrical=False, related_name="followers", blank=True)

    @property
    def followers_count(self):
        return self.followers.count()

    @property
    def following_count(self):
        return self.following.count()
    
class Genre(models.Model):
    name = models.CharField(max_length=1000, unique=True)

    def __str__(self):
        return self.name

from django.utils import timezone

from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.search import SearchVectorField

class Quote(models.Model):
    quote_text = models.TextField()
    quote_author = models.CharField(max_length=1000, blank=True, null=True)
    quote_source = models.CharField(max_length=1000, blank=True, null=True)
    quote_genre = models.ForeignKey(Genre, on_delete=models.SET_NULL, null=True, blank=True, related_name="quotes")
    created_at = models.DateTimeField(auto_now_add=True)
    search_vector = SearchVectorField(null=True, blank=True)

    class Meta:
        indexes = [GinIndex(fields=["search_vector"])]

class QuoteInfo(models.Model):
    quote = models.OneToOneField(Quote, on_delete=models.CASCADE, related_name="info")
    upvotes = models.PositiveIntegerField(default=0)
    downvotes = models.PositiveIntegerField(default=0)
    copy_count = models.PositiveIntegerField(default=0)


class CommunityQuote(models.Model):
    quote_owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='community_quotes')
    quote_text = models.TextField()
    quote_genre = models.ForeignKey(
        Genre,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="community_quotes"
    )


    def __str__(self):
        return self.quote_text

class SearchQuery(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='latest_search_queries')
    query = models.TextField(blank=True)

class UserEngagement(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='engagement')
    liked_quotes = models.ManyToManyField(Quote, related_name="liked_by", blank=True, db_index=True)
    disliked_quotes = models.ManyToManyField(Quote, related_name="disliked_by", blank=True, db_index=True)
    saved_quotes = models.ManyToManyField(Quote, related_name="saved_by", blank=True)

    user_profile = models.JSONField(default=dict)
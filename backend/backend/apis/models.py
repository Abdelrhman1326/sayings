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

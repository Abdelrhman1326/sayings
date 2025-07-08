from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    created = models.DateTimeField(auto_now_add=True)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField()
    password = models.CharField(max_length=128)  # Store hashed password only!
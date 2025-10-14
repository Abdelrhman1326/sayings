from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from .models import User, Quote, CommunityQuote, UserEngagement

# Auth:
class SignupSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        required=False,
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message="Username already exists"
            )
        ],
        error_messages={
            'blank': 'Username field may not be blank',
        }
    )

    email = serializers.EmailField(
        required=False,
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message="Email already exists"
            )
        ],
        error_messages={
            'blank': 'Email field may not be blank',
            'invalid': 'Enter a valid email address',
        }
    )

    password = serializers.CharField(
        write_only=True,
        required=False,
        validators=[validate_password],
        error_messages={
            'blank': 'Password field may not be blank',
        }
    )

    confirm_password = serializers.CharField(
        write_only=True,
        required=False,
        error_messages={
            'blank': 'Confirm password field may not be blank',
        }
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirm_password']

    def validate(self, attrs):
        required_fields = ['username', 'email', 'password', 'confirm_password']
        errors = {}

        # Manual required field validation first
        for field in required_fields:
            value = attrs.get(field)
            if value is None or (isinstance(value, str) and value.strip() == ""):
                errors[field] = f"{field.replace('_', ' ').capitalize()} field is required"

        if errors:
            raise serializers.ValidationError(errors)

        # Now it's safe to compare passwords
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                'password': 'Passwords do not match'
            })

        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        validated_data['password'] = make_password(validated_data['password'])
        return User.objects.create(**validated_data)
    

# users:
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(
        required=True,
        error_messages={
            'required': 'Username field is required',
            'blank': 'Username field may not be blank',
        }
    )
    password = serializers.CharField(
        write_only = True,
        required = True,
        error_messages={
            'required': 'Password field is required',
            'blank': 'Password field may not be blank',
        }
    )

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError({'detail': 'Invalid username or password'})
        
        attrs['user'] = user
        return attrs
    

class UserEngagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserEngagement
        fields = ['favorite_genres']


# Quotes:
class QuoteSerializer(serializers.ModelSerializer):
    likes_count = serializers.IntegerField(source='info.upvotes', read_only=True)
    dislikes_count = serializers.IntegerField(source='info.downvotes', read_only=True)

    class Meta:
        model = Quote
        fields = ['id', 'quote_text', 'quote_author', 'quote_genre', 'quote_source', 'likes_count', 'dislikes_count']

class DeleteQuoteSerializer(serializers.Serializer):
    id = serializers.IntegerField()

class QuoteSearchSerializer(serializers.Serializer):
    q = serializers.CharField(required=True)
    af = serializers.CharField(required=False)
    gf = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )


# Community Quotes:
from rest_framework import serializers
from .models import CommunityQuote, Genre

class CommunityQuoteSerializer(serializers.ModelSerializer):
    # Accept genre name as input
    quote_genre = serializers.CharField(write_only=True)

    class Meta:
        model = CommunityQuote
        fields = ["id", "quote_text", "quote_genre"]

    def create(self, validated_data):
        genre_name = validated_data.pop("quote_genre", None)
        quote = CommunityQuote.objects.create(**validated_data)

        if genre_name:
            genre, _ = Genre.objects.get_or_create(name=genre_name)
            quote.quote_genre = genre
            quote.save()

        return quote

    def to_representation(self, instance):
        """Control how quote_genre is displayed when reading"""
        data = super().to_representation(instance)
        data["quote_genre"] = instance.quote_genre.name if instance.quote_genre else None
        return data

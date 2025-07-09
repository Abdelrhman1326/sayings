from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password
from .models import User


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

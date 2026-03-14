"""
Django settings for backend project.
Secrets are loaded from .env for security.
"""

from pathlib import Path
from decouple import config
import dj_database_url

# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY
SECRET_KEY = config("SECRET_KEY")  # from .env
DEBUG = config("DEBUG", default=True, cast=bool)
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="localhost,127.0.0.1,sayings-quotes.vercel.app", cast=lambda v: [s.strip() for s in v.split(",")])

# Application definition
INSTALLED_APPS = [
    'rest_framework',
    'drf_spectacular',
    'drf_spectacular_sidecar',
    'corsheaders',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'silk',
    'apis.apps.ApisConfig',
    'rest_framework_simplejwt',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    # CSRF middleware removed since we're using JWT authentication
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'silk.middleware.SilkyMiddleware',
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default="http://localhost:5173,http://127.0.0.1:5173,https://sayings-quotes.vercel.app,https://sayings-quotes.vercel.app/",
    cast=lambda v: [s.strip() for s in v.split(",")]
)
CSRF_TRUSTED_ORIGINS = config(
    "CSRF_TRUSTED_ORIGINS",
    default="http://localhost:5173,http://127.0.0.1:5173,https://sayings-quotes.vercel.app,https://sayings-quotes.vercel.app/",
    cast=lambda v: [s.strip() for s in v.split(",")]
)

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {'context_processors': [
            'django.template.context_processors.request',
            'django.contrib.auth.context_processors.auth',
            'django.contrib.messages.context_processors.messages',
        ]},
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# Database
DATABASES = {
    'default': dj_database_url.config(
        default=config("DATABASE_URL"),
        conn_max_age=600,
        ssl_require=True
    )
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = 'static/'

# Default primary key
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom user model
AUTH_USER_MODEL = 'apis.User'

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

# JWT Settings
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}


#
#
# """
# Django settings for backend project.
# Secrets are loaded from .env for security.
# """
#
# from pathlib import Path
# from decouple import config
# import dj_database_url
# import os
#
# # Build paths
# BASE_DIR = Path(__file__).resolve().parent.parent
#
# # SECURITY
# SECRET_KEY = config("SECRET_KEY")
# DEBUG = config("DEBUG", default=False, cast=bool)
#
# # ALLOWED_HOSTS
# ALLOWED_HOSTS = config(
#     "ALLOWED_HOSTS",
#     default="localhost,127.0.0.1,sayings-quotes.vercel.app,abdelrhmanmo-sayings-api.hf.space",
#     cast=lambda v: [s.strip() for s in v.split(",")]
# )
#
# # Application definition
# INSTALLED_APPS = [
#     'rest_framework',
#     'drf_spectacular',
#     'drf_spectacular_sidecar',
#     'corsheaders',
#     'django.contrib.admin',
#     'django.contrib.auth',
#     'django.contrib.contenttypes',
#     'django.contrib.sessions',
#     'django.contrib.messages',
#     'django.contrib.staticfiles',
#     'apis.apps.ApisConfig',
# ]
#
# if DEBUG:
#     INSTALLED_APPS.append('silk')
#
# MIDDLEWARE = [
#     'corsheaders.middleware.CorsMiddleware',  # Must stay at the top
#     'django.middleware.security.SecurityMiddleware',
#     'django.contrib.sessions.middleware.SessionMiddleware',
#     'django.middleware.common.CommonMiddleware',
#     'django.middleware.csrf.CsrfViewMiddleware',
#     'django.contrib.auth.middleware.AuthenticationMiddleware',
#     'django.contrib.messages.middleware.MessageMiddleware',
#     'django.middleware.clickjacking.XFrameOptionsMiddleware',
# ]
#
# if DEBUG:
#     MIDDLEWARE.append('silk.middleware.SilkyMiddleware')
#
# # --- CORS & CSRF CONFIGURATION ---
#
# CORS_ALLOW_CREDENTIALS = True
#
# CORS_ALLOWED_ORIGINS = config(
#     "CORS_ALLOWED_ORIGINS",
#     default="http://localhost:5173,http://127.0.0.1:5173,https://sayings-quotes.vercel.app",
#     cast=lambda v: [s.strip() for s in v.split(",")]
# )
#
# CSRF_TRUSTED_ORIGINS = config(
#     "CSRF_TRUSTED_ORIGINS",
#     default="http://localhost:5173,http://127.0.0.1:5173,https://sayings-quotes.vercel.app",
#     cast=lambda v: [s.strip() for s in v.split(",")]
# )
#
# # Important for mobile: explicitly allow headers to be seen by the client
# CORS_EXPOSE_HEADERS = ['Content-Type', 'X-CSRFToken']
#
# # --- COOKIE SECURITY (THE MOBILE FIX) ---
#
# # Session Cookies
# SESSION_COOKIE_SAMESITE = "None"
# SESSION_COOKIE_SECURE = True
# SESSION_COOKIE_HTTPONLY = True
#
# # CSRF Cookies
# CSRF_COOKIE_SAMESITE = "None"
# CSRF_COOKIE_SECURE = True
# # Must be False so your frontend JS can read the cookie to send the X-CSRFToken header
# CSRF_COOKIE_HTTPONLY = False
#
# # --- CORE SETTINGS ---
#
# ROOT_URLCONF = 'backend.urls'
#
# TEMPLATES = [
#     {
#         'BACKEND': 'django.template.backends.django.DjangoTemplates',
#         'DIRS': [],
#         'APP_DIRS': True,
#         'OPTIONS': {'context_processors': [
#             'django.template.context_processors.request',
#             'django.contrib.auth.context_processors.auth',
#             'django.contrib.messages.context_processors.messages',
#         ]},
#     },
# ]
#
# WSGI_APPLICATION = 'backend.wsgi.application'
#
# # Database
# # Ensure DATABASE_URL in Hugging Face has ?sslmode=require
# DATABASES = {
#     'default': dj_database_url.config(
#         default=config("DATABASE_URL"),
#         conn_max_age=600,
#         ssl_require=True
#     )
# }
#
# # Password validation
# AUTH_PASSWORD_VALIDATORS = [
#     {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
#     {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
#     {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
#     {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
# ]
#
# # Internationalization
# LANGUAGE_CODE = 'en-us'
# TIME_ZONE = 'UTC'
# USE_I18N = True
# USE_TZ = True
#
# # Static files
# STATIC_URL = 'static/'
# STATIC_ROOT = BASE_DIR / "staticfiles"
#
# DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
# AUTH_USER_MODEL = 'apis.User'
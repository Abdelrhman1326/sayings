from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Quote, CommunityQuote, QuoteInfo, Genre

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    pass

@admin.register(Quote)
class QuoteAdmin(admin.ModelAdmin):
    list_display = ('quote_text', 'quote_author', 'quote_source', 'quote_genre',)
    search_fields = ('quote_text', 'quote_author', 'quote_source', 'quote_genre',)

@admin.register(CommunityQuote)
class CommunityQuoteAdmin(admin.ModelAdmin):
    list_display = ('quote_owner', 'quote_text', 'quote_genre',)
    search_fields = ('quote_owner', 'quote_text', 'quote_genre',)

@admin.register(QuoteInfo)
class QuoteInfoAdmin(admin.ModelAdmin):
    list_display = ('quote_id', 'upvotes', 'downvotes',)

@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name', )

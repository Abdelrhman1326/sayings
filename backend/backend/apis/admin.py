from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    pass

from .models import Quote, CommunityQuote

@admin.register(Quote)
class QuoteAdmin(admin.ModelAdmin):
    list_display = ('quote_text', 'quote_author', 'quote_source')
    search_fields = ('quote_text', 'quote_author', 'quote_source')

@admin.register(CommunityQuote)
class CommunityQuoteAdmin(admin.ModelAdmin):
    list_display = ['quote_owner', 'quote_text', 'quote_genre']

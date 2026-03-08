from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.postgres.search import SearchVector
from apis.models import Quote


@receiver(post_save, sender=Quote)
def update_search_vector(sender, instance, created, **kwargs):
    if created:
        Quote.objects.filter(id=instance.id).update(
            search_vector=(
                    SearchVector('quote_text', weight='A') +
                    SearchVector('quote_author', weight='B')
            )
        )

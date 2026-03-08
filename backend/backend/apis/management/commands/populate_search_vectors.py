from django.core.management.base import BaseCommand
from django.contrib.postgres.search import SearchVector
from apis.models import Quote

class Command(BaseCommand):
    help = "Populate search_vector for all quotes (only missing ones)."

    def handle(self, *args, **options):
        quotes_to_update = Quote.objects.filter(search_vector__isnull=True)
        count = quotes_to_update.update(
            search_vector=(
                SearchVector('quote_text', weight='A') +
                SearchVector('quote_author', weight='B')
            )
        )

        if count == 0:
            self.stdout.write(self.style.WARNING("All quotes already have search vectors. Nothing to update."))
        else:
            self.stdout.write(self.style.SUCCESS(f"Populated search vectors for {count} new quotes."))

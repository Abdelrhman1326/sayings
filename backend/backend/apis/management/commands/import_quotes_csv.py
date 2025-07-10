import csv
from django.core.management.base import BaseCommand, CommandError
from apis.models import Quote

class Command(BaseCommand):
    help = 'Bulk import quotes from a CSV file'

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str, help='Path to CSV file')

    def handle(self, *args, **options):
        file_path = options['file_path']
        batch_size = 50_000
        quotes = []
        total = 0

        try:
            with open(file_path, newline='', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    quotes.append(Quote(
                        quote_text=row.get('quote') or row.get('Quote') or '',
                        quote_author=row.get('author') or row.get('Author') or '',
                        quote_genre=row.get('genre') or '',
                        quote_source='CSV Source'
                    ))

                    if len(quotes) >= batch_size:
                        Quote.objects.bulk_create(quotes)
                        total += len(quotes)
                        self.stdout.write(f"Imported {total}...")
                        quotes.clear()

                if quotes:
                    Quote.objects.bulk_create(quotes)
                    total += len(quotes)

            self.stdout.write(self.style.SUCCESS(f"Done. Imported {total} quotes from CSV."))

        except FileNotFoundError:
            raise CommandError(f"File not found: {file_path}")

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
                    # Extract author and source from 'author' field
                    author_field = row.get('author') or row.get('Author') or ''
                    parts = [p.strip() for p in author_field.split(',', 1)]
                    quote_author = parts[0]
                    quote_source = parts[1] if len(parts) > 1 else ''

                    quotes.append(Quote(
                        quote_text=row.get('quote') or row.get('Quote') or '',
                        quote_author=quote_author,
                        quote_genre=row.get('category') or '',
                        quote_source=quote_source
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

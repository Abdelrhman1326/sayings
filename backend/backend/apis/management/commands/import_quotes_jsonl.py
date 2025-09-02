import json
from django.core.management.base import BaseCommand, CommandError
from apis.models import Quote, Genre

class Command(BaseCommand):
    help = 'Bulk import quotes from a JSON file (array of objects), handle duplicates, sources, and genres'

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str, help='Path to JSON file')
        parser.add_argument('--batch_size', type=int, default=50000, help='Number of quotes per bulk insert')

    def handle(self, *args, **options):
        file_path = options['file_path']
        batch_size = options['batch_size']
        quotes = []
        total_imported = 0
        total_skipped = 0

        # Cache existing quotes to prevent duplicates
        existing_texts = set(Quote.objects.values_list('quote_text', flat=True))

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data_list = json.load(f)  # <-- load entire array

                for data in data_list:
                    quote_text = data.get('Quote', '').strip()
                    author_field = data.get('Author', '').strip()
                    category = data.get('Category', '').strip()

                    if not quote_text or quote_text in existing_texts:
                        total_skipped += 1
                        continue

                    # Source detection
                    quote_author = author_field
                    quote_source = ''
                    if ',' in author_field:
                        parts = author_field.split(',', 1)
                        quote_author = parts[0].strip()
                        quote_source = parts[1].strip()

                    genre, _ = Genre.objects.get_or_create(name=category)

                    quotes.append(Quote(
                        quote_text=quote_text,
                        quote_author=quote_author,
                        quote_source=quote_source,
                        quote_genre=genre
                    ))
                    existing_texts.add(quote_text)

                    if len(quotes) >= batch_size:
                        Quote.objects.bulk_create(quotes)
                        total_imported += len(quotes)
                        self.stdout.write(f"Imported {total_imported} quotes so far...")
                        quotes.clear()

                if quotes:
                    Quote.objects.bulk_create(quotes)
                    total_imported += len(quotes)

            self.stdout.write(self.style.SUCCESS(
                f"Done. Imported {total_imported} quotes. Skipped {total_skipped} duplicates."
            ))

        except FileNotFoundError:
            raise CommandError(f"File not found: {file_path}")
        except json.JSONDecodeError as e:
            raise CommandError(f"Invalid JSON: {e}")

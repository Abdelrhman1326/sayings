import json
from django.core.management.base import BaseCommand, CommandError
from apis.models import Quote

class Command(BaseCommand):
    help = 'Bulk import quotes from a JSONL file'

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str, help='Path to JSONL file')

    def handle(self, *args, **options):
        file_path = options['file_path']
        batch_size = 50_000
        quotes = []
        total = 0

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                for line in f:
                    data = json.loads(line)
                    quotes.append(Quote(
                        quote_text=data.get('quote', ''),
                        quote_author=data.get('author', ''),
                        quote_genre=', '.join(data.get('tags', [])),
                        quote_source='Goodreads'
                    ))

                    if len(quotes) >= batch_size:
                        Quote.objects.bulk_create(quotes)
                        total += len(quotes)
                        self.stdout.write(f"Imported {total}...")
                        quotes.clear()

                if quotes:
                    Quote.objects.bulk_create(quotes)
                    total += len(quotes)

            self.stdout.write(self.style.SUCCESS(f"Done. Imported {total} quotes from JSONL."))

        except FileNotFoundError:
            raise CommandError(f"File not found: {file_path}")

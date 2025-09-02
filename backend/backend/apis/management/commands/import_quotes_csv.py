import csv
from django.core.management.base import BaseCommand, CommandError
from apis.models import Quote, Genre

class Command(BaseCommand):
    help = 'Bulk import quotes from a CSV file and assign a single genre'

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str, help='Path to CSV file')

    def handle(self, *args, **options):
        file_path = options['file_path']
        total = 0
        skipped = 0
        batch_size = 20000  # large batch size for performance

        try:
            with open(file_path, newline='', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)

                buffer = []
                for row in reader:
                    quote_text = (row.get('quote') or row.get('Quote') or '').strip()
                    if not quote_text:
                        continue

                    # author
                    quote_author = (row.get('author') or row.get('Author') or '').strip()
                    # source
                    quote_source = (row.get('source') or '').strip()
                    # genre (theme/tag)
                    genre_name = (row.get('theme/tag') or '').strip()

                    buffer.append((quote_text, quote_author, quote_source, genre_name))

                    if len(buffer) >= batch_size:
                        imported, skipped_batch = self._insert_quotes(buffer)
                        total += imported
                        skipped += skipped_batch
                        buffer.clear()
                        self.stdout.write(self.style.NOTICE(
                            f"Processed {total+skipped} rows so far..."
                        ))

                if buffer:
                    imported, skipped_batch = self._insert_quotes(buffer)
                    total += imported
                    skipped += skipped_batch

            self.stdout.write(self.style.SUCCESS(
                f"✅ Done. Imported {total} quotes. Skipped {skipped} duplicates."
            ))

        except FileNotFoundError:
            raise CommandError(f"File not found: {file_path}")

    def _insert_quotes(self, rows):
        imported = 0
        skipped = 0

        texts = [q[0] for q in rows]
        existing = set(
            Quote.objects.filter(quote_text__in=texts).values_list("quote_text", flat=True)
        )

        for quote_text, quote_author, quote_source, genre_name in rows:
            if quote_text in existing:
                skipped += 1
                continue

            # Create or get genre
            genre_obj = None
            if genre_name:
                genre_obj, _ = Genre.objects.get_or_create(name=genre_name)

            # Create quote
            Quote.objects.create(
                quote_text=quote_text,
                quote_author=quote_author,
                quote_source=quote_source,
                quote_genre=genre_obj
            )

            imported += 1

        return imported, skipped

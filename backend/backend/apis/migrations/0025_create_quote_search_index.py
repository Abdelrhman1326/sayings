from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        # This resolves the CommandError by making this migration depend on the 0024 migration.
        ('apis', '0024_alter_userengagement_disliked_quotes_and_more'),
    ]

    operations = [
        # 1. Optional: Ensure the pg_trgm extension is available
        # This is useful for similarity matching, but not strictly required for basic FTS.
        migrations.RunSQL(
            "CREATE EXTENSION IF NOT EXISTS pg_trgm;",
            "DROP EXTENSION IF EXISTS pg_trgm;"
        ),

        # 2. Add the custom GIN index for Full-Text Search
        # NOTE: The table name is assumed to be 'apis_quote'. Adjust if your app is named differently.
        migrations.RunSQL(
            """
            CREATE INDEX idx_quote_search_vector ON apis_quote
            USING GIN (
                (
                    setweight(to_tsvector('english', quote_text), 'A') ||
                    setweight(to_tsvector('english', quote_author), 'B') ||
                    setweight(to_tsvector('english', quote_source), 'D')
                )
            );
            """,
            # The reverse operation (for un-doing the migration)
            """
            DROP INDEX IF EXISTS idx_quote_search_vector;
            """
        )
    ]

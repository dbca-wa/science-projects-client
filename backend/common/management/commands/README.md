# Django Management Commands

This directory contains custom Django management commands for the SPMS backend.

## Available Commands

### fix_sequences

Fixes PostgreSQL auto-increment sequences for all models to prevent duplicate key errors.

**Problem**: After data migrations or bulk imports, PostgreSQL sequences can become out of sync with the actual maximum ID in tables. This causes `IntegrityError: duplicate key value violates unique constraint` errors when trying to create new records.

**Solution**: This command automatically detects and fixes all out-of-sync sequences across all models.

#### Usage

```bash
# Preview what will be fixed (dry run)
poetry run python manage.py fix_sequences --dry-run

# Fix all sequences
poetry run python manage.py fix_sequences

# Fix sequences and clear all caches
poetry run python manage.py fix_sequences --invalidate-cache

# Show all models including those that don't need fixing
poetry run python manage.py fix_sequences --dry-run --verbose
```

#### Options

- `--dry-run`: Preview changes without applying them
- `--verbose`: Show all models including those skipped (already correct or no sequence)
- `--invalidate-cache`: Clear all Django caches after fixing sequences (recommended after migrations)

#### When to Run

Run this command:
- After importing data from another database
- After running data migrations that insert records with explicit IDs
- After bulk creating records with custom IDs
- When you encounter "duplicate key" errors on record creation
- After migrations that may have caused sequence issues (use with `--invalidate-cache`)

#### Output Example

```
Checking 60 models...
✓ ProjectMember                  | Fixed: 3287 → 3867 (max_id: 3866)
✓ Project                        | Fixed: 1047 → 1292 (max_id: 1291)
✓ UserProfile                    | Fixed: 1850 → 1851 (max_id: 1850)

======================================================================
Fixed:   37 sequences
Skipped: 20 sequences (already correct)

✓ All sequences have been fixed!
```

#### Safety

- The command is safe to run multiple times
- It only fixes sequences that are behind the actual max ID
- It skips sequences that are already correct
- Use `--dry-run` to preview changes without applying them
- Maintains data integrity by setting sequences to `max_id + 1`

#### Technical Details

For each model with an `id` primary key:
1. Checks if the sequence exists
2. Gets the current maximum ID from the table
3. Gets the current sequence value
4. If sequence ≤ max_id, resets sequence to max_id + 1
5. If table is empty, resets sequence to 1

The command uses PostgreSQL's `setval()` function to update sequences safely.

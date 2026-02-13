#!/usr/bin/env bash
# Wrapper script to run backend pre-commit hooks only on changed backend files

set -e

# Get list of changed files in backend directory
CHANGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep "^backend/" || true)

if [ -z "$CHANGED_FILES" ]; then
    echo "No backend files changed, skipping backend checks"
    exit 0
fi

echo "Running backend pre-commit checks on changed files..."

# Change to backend directory and set PRE_COMMIT_SOURCE_DIR
cd backend
export PRE_COMMIT_SOURCE_DIR="$(pwd)"

# Convert absolute paths to relative paths within backend/
BACKEND_FILES=$(echo "$CHANGED_FILES" | sed 's|^backend/||')

# Run pre-commit on only the changed files
if [ -n "$BACKEND_FILES" ]; then
    echo "$BACKEND_FILES" | xargs pre-commit run --files
else
    echo "No backend files to check"
fi

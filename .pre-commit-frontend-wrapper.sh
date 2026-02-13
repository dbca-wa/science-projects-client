#!/usr/bin/env bash
# Wrapper script to run frontend pre-commit hooks only on changed frontend files

set -e

# Get list of changed files in frontend directory
CHANGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep "^frontend/" || true)

if [ -z "$CHANGED_FILES" ]; then
    echo "No frontend files changed, skipping frontend checks"
    exit 0
fi

echo "Running frontend pre-commit checks on changed files..."

# Change to frontend directory and set PRE_COMMIT_SOURCE_DIR
cd frontend
export PRE_COMMIT_SOURCE_DIR="$(pwd)"

# Convert absolute paths to relative paths within frontend/
FRONTEND_FILES=$(echo "$CHANGED_FILES" | sed 's|^frontend/||')

# Run pre-commit on only the changed files
if [ -n "$FRONTEND_FILES" ]; then
    echo "$FRONTEND_FILES" | xargs pre-commit run --files
else
    echo "No frontend files to check"
fi

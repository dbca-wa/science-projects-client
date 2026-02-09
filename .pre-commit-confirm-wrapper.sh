#!/bin/bash
# Pre-commit confirmation wrapper
# Runs all checks and prompts user to confirm commit

set -e

# Colours for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Colour

# Track if any issues were found
ISSUES_FOUND=0

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Running Pre-Commit Checks                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to run a check and display results
run_check() {
    local check_name="$1"
    local check_command="$2"

    echo -e "${BLUE}▶ Running ${check_name}...${NC}"

    if eval "$check_command" > /tmp/precommit_output.txt 2>&1; then
        echo -e "${GREEN}✓ ${check_name} passed${NC}"
        echo ""
    else
        echo -e "${YELLOW}⚠ ${check_name} found issues:${NC}"
        cat /tmp/precommit_output.txt
        echo ""
        ISSUES_FOUND=1
    fi

    rm -f /tmp/precommit_output.txt
}

# Run flake8 (linting)
if command -v poetry &> /dev/null; then
    run_check "Flake8 (linting)" "poetry run flake8 --max-line-length=88 --extend-ignore=E203,W503,E501 --exclude=migrations,__pycache__,.venv,venv,build,dist,_refactor_archive ."
else
    echo -e "${YELLOW}⚠ Poetry not found, skipping flake8${NC}"
    echo ""
fi

# Run bandit (security)
if command -v poetry &> /dev/null; then
    run_check "Bandit (security)" "poetry run bandit -c pyproject.toml -r . -q"
else
    echo -e "${YELLOW}⚠ Poetry not found, skipping bandit${NC}"
    echo ""
fi

# Summary
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Pre-Commit Check Summary                           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
else
    echo -e "${YELLOW}⚠ Some checks found issues (see above)${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Prompt for confirmation
echo -e "${YELLOW}Do you want to proceed with the commit?${NC}"
echo -e "  ${GREEN}y${NC} or ${GREEN}yes${NC} - Proceed with commit"
echo -e "  ${RED}n${NC}, ${RED}no${NC}, ${RED}q${NC}, or ${RED}Ctrl+C${NC} - Cancel commit"
echo ""
echo -n "Your choice: "

# Read user input from terminal directly (no timeout for now to debug)
read -r response < /dev/tty

# Convert to lowercase
response=$(echo "$response" | tr '[:upper:]' '[:lower:]')

case "$response" in
    y|yes)
        echo ""
        echo -e "${GREEN}✓ Proceeding with commit...${NC}"
        echo ""
        exit 0
        ;;
    n|no|q|quit)
        echo ""
        echo -e "${RED}✗ Commit cancelled by user${NC}"
        echo ""
        exit 1
        ;;
    *)
        echo ""
        echo -e "${RED}✗ Invalid response. Commit cancelled.${NC}"
        echo ""
        exit 1
        ;;
esac

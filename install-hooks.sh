#!/bin/sh

cp .claude/hooks/pre-commit.sh .git/hooks/pre-commit
cp .claude/hooks/post-commit.sh .git/hooks/post-commit
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/post-commit
echo "Hooks installed successfully."

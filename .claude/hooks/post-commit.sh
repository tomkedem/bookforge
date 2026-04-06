#!/bin/sh

echo "Commit completed: $(git log -1 --pretty=%B)"
echo "Files changed: $(git diff-tree --no-commit-id -r --name-only HEAD | wc -l)"

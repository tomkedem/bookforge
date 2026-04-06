#!/bin/sh

echo "Running Quality Gate before commit..."

npm test

if [ $? -ne 0 ]; then
  echo "Tests failed. Commit aborted."
  exit 1
fi

echo "All checks passed. Proceeding with commit."
exit 0

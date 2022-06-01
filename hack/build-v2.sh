#!/bin/bash

set -euo pipefail

git stash
git checkout v2
git merge main --no-edit

# Build
yarn build
git add dist || true
git commit -m "Build action" --allow-empty

# Push
git push -u origin v2:v2

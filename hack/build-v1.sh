#!/bin/bash

set -euo pipefail

git stash
git checkout v1
git merge main --no-edit

# Build
yarn build
yarn package
git add lib dist || true
git commit -m "Build action" --allow-empty

# Push
git push -u origin v1:v1
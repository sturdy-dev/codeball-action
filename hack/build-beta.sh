#!/bin/bash

set -euo pipefail
set -x

# Delete any existing beta branch
git branch -D beta || true

git checkout -b beta

# Build
yarn build
yarn package
git add lib dist || true
git commit -m "Build action" --allow-empty

# Use @beta version of the action
ls **/action.yml | xargs -n1 gsed -i 's/@v1/@beta/'
git add **/action.yml || true
git commit -m "Use beta version" --allow-empty

# Push
git push -u origin beta:beta
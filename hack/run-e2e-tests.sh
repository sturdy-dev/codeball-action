#!/bin/bash

set -euo pipefail

yarn build
yarn package

act pull_request -e tests/act-pull-request.json \
  -s GITHUB_TOKEN=${GITHUB_TOKEN} \
  --env CODEBALL_API_HOST=http://host.docker.internal:8080
#!/bin/bash

set -euo pipefail

[[ -z $(command -v act) ]] && echo "act not found, install https://github.com/nektos/act" && exit 1
[[ -z ${GITHUB_TOKEN} ]] && echo "GITHUB_TOKEN env variable is required. obtail one from https://github.com/settings/tokens/new" && exit 1

yarn build

act pull_request -e tests/act-pull-request.json \
	-s GITHUB_TOKEN=${GITHUB_TOKEN} \
	--env CODEBALL_API_HOST=http://host.docker.internal:8080

# Developing codeball-action

```
# Install dependencies
yarn install

# Run tests (using act: https://github.com/nektos/act)
GITHUB_TOKEN=<your-github-token> ./hack/run-e2e-tests.sh

# Make a release
./hack/build-v1.sh
```
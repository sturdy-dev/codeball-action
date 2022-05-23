# Codeball Actions 🔮

**AI-POWERED CODE REVIEW**

**Save time and $$$, use Codeball to perform an early review of all your code.**

* [Online Demo](http://codeball.forfunc.com/)

## Quick Start

1. Create a new file called `.github/workflows/codeball.yml` with the following content:

```yaml
on: [pull_request]

jobs:
  codeball_job:
    runs-on: ubuntu-latest
    name: Run Codeball
    steps:
      - name: Codeball AI Actions
        uses: sturdy-dev/codeball-action@v1
```

2. 🎉 That's it! Codeball will now run on your pull requests, and will pre-approve your PR if it's a good one!

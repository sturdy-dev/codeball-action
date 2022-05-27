# Codeball Actions 🔮

**AI-POWERED CODE REVIEW**

![github_bg](https://user-images.githubusercontent.com/47952/170700847-bb0cac65-f269-4758-955a-632c48f47290.png)

**Save time and $$$, use Codeball to perform an early review of all your code.**

- [Online Demo](https://codeball.ai/)

## Quick Start

1. Create a new file called `.github/workflows/codeball.yml` with the following content:

```yaml
name: Codeball
on: [pull_request]

jobs:
  codeball_job:
    runs-on: ubuntu-latest
    name: Run Codeball
    steps:
      - name: Codeball AI Actions
        uses: sturdy-dev/codeball-action@v1
        # with:
        #   do-label: "true"                    # Configure if the action should label approved contributions
        #   label-name: "codeball:approved"     # Configure the label name to set if Codeball approves the contribution
        #   do-approve: "true"                  # Configure if the action should approve PRs that have been approved by Codeball
```

2. 🎉 That's it! Codeball will now run on your pull requests, and will pre-approve your PR if it's a good one!

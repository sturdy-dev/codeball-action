![github_bg](https://user-images.githubusercontent.com/47952/170700847-bb0cac65-f269-4758-955a-632c48f47290.png)

# Codeball Actions &mdash; AI-POWERED CODE REVIEW

> It approves Pull Requests that a human would have approved. Wait less for review, save time and $$$.

The Codeball GitHub Action runs [Codeball](https://codeball.ai/) on all new Pull Requests, and approves the Pull Request ([example](https://github.com/sturdy-dev/codeball-action/pull/7)) if Codeball approves it.

- [Online Demo](https://codeball.ai/)
- [How Codeball Works](https://codeball.ai/how)

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

## Troubleshooting

### Permissions

Codeball works out of the box with GitHub Actions. 

If you're using non-default permissions, or want to use a custom access token. Make sure that you're running Codeball with the follwing permissions:

```yaml
permissions:
  contents: read
  issues: write
  pull-requests: write
```

### Forks and private repositories

By default, only pull requests from a fork does not have "write" permissions when running in GitHub Actions, and those Pull Requests can not be approved.

If you're using forks from a private repository, and want to use Codeball on Pull Requests created from a fork.  Enable "Send write tokens to workflows from fork pull requests" on the repository ([docs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository#enabling-workflows-for-private-repository-forks)).
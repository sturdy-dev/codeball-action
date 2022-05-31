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
    name: Codeball
    steps:
      - name: Codeball
        uses: sturdy-dev/codeball-action@v2
```

2. 🎉 That's it! Codeball will now run on your pull requests, and will pre-approve your PR if it's a good one!

## Customizations

Codeball Actions are built on multiple smaller building-blocks, that are heavily configurable through GitHub Actions.

### Example: "Dry-run" mode, labels all PRs with the Codeball Result

<details>
  <summary>codeball-dry-run.yml</summary>
  
```yaml
on: [pull_request]

permissions:
  contents: read
  issues: write
  pull-requests: write

jobs:
  codeball:
    runs-on: ubuntu-latest
    name: Codeball
    steps:

      # Start a new Codeball review job
      # This step is asynchronous and will return a job id
      - name: Trigger Codeball
        id: codeball_baller
        uses: sturdy-dev/codeball-action/baller@v2


      # Wait for Codeball to return the status
      - name: Get Status
        id: codeball_status
        uses: sturdy-dev/codeball-action/status@v2
        with:
          codeball-job-id: ${{ steps.codeball_baller.outputs.codeball-job-id }}

      # If Codeball approved the contribution, add a "codeball:approved" label
      - name: Label Approved
        uses: sturdy-dev/codeball-action/labeler@v2
        if: ${{ steps.codeball_status.outputs.approved == 'true' }}
        with:
          name: "codeball:approved"
          color: "86efac" # green

      # If Codeball did not approve the contribution, add a "codeball:needs-review" label
      - name: Label Needs Review
        uses: sturdy-dev/codeball-action/labeler@v2
        if: ${{ steps.codeball_status.outputs.approved == 'false' }}
        with:
          name: "codeball:needs-review"
          color: "bfdbfe" # blue

```
</details>

### Example: Approve only (no labels)

<details>
  <summary>codeball-approve.yml</summary>
  
```yaml
on: [pull_request]

permissions:
  contents: read
  issues: write
  pull-requests: write

jobs:
  codeball:
    runs-on: ubuntu-latest
    name: Codeball
    steps:

      # Start a new Codeball review job
      # This step is asynchronous and will return a job id
      - name: Trigger Codeball
        id: codeball_baller
        uses: sturdy-dev/codeball-action/baller@v2


      # Wait for Codeball to return the status
      - name: Get Status
        id: codeball_status
        uses: sturdy-dev/codeball-action/status@v2
        with:
          codeball-job-id: ${{ steps.codeball_baller.outputs.codeball-job-id }}

      # If Codeball approved the contribution, approve the PR
      - name: Approve PR
        uses: sturdy-dev/codeball-action/approver@v2
        if: ${{ steps.codeball_status.outputs.approved == 'true' }}
        with:
          message: "Codeball: LGTM! :+1:"
```
</details>


### Example: Filter files (run only for PRs modifying a single service)

<details>
  <summary>codeball-filter-files.yml</summary>
  
```yaml
on:
  pull_request:
    # Run Codeball only if files under "/web/" has been modified (and no other files)
    # See: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#example-including-and-excluding-paths
    paths:
      - '!**'
      - '/web/**'

permissions:
  contents: read
  issues: write
  pull-requests: write

jobs:
  codeball:
    runs-on: ubuntu-latest
    name: Codeball

    steps:

      # Start a new Codeball review job
      # This step is asynchronous and will return a job id
      - name: Trigger Codeball
        id: codeball_baller
        uses: sturdy-dev/codeball-action/baller@v2


      # Wait for Codeball to return the status
      - name: Get Status
        id: codeball_status
        uses: sturdy-dev/codeball-action/status@v2
        with:
          codeball-job-id: ${{ steps.codeball_baller.outputs.codeball-job-id }}

      # If Codeball approved the contribution, approve the PR
      - name: Approve PR
        uses: sturdy-dev/codeball-action/approver@v2
        if: ${{ steps.codeball_status.outputs.approved == 'true' }}
        with:
          message: "Codeball: LGTM! :+1:"
```
</details>


## Building Blocks

The Codeball sub-actions are:

* [`sturdy-dev/codeball-action/baller/@v2`](./baller/README.md) – Triggers new Codeball Jobs
* [`sturdy-dev/codeball-action/status/@v2`](./status/README.md) – Waits for the the Codeball result
* [`sturdy-dev/codeball-action/approver/@v2`](./approver/README.md) – Approves PRs
* [`sturdy-dev/codeball-action/labeler/@v2`](./labeler/README.md) – Adds labels to PRs

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

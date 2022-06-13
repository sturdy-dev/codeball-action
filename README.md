![Codeball](https://user-images.githubusercontent.com/47952/173048697-d3d39fc3-6238-4fc3-9baf-ccbbb3b4258c.png)


# CODEBALL &mdash; AI CODE REVIEW 🔮

Codeball is a code review AI which approves Pull Requests that a human would have approved. Spend less time waiting, save time and money.

The AI identifies and approves safe contributions, so that you get to focus your energy on the tricky ones.

## GitHub Action

The Codeball GitHub Action runs [Codeball](https://codeball.ai/) on all new Pull Requests, and approves the Pull Request ([example](https://github.com/sturdy-dev/codeball-action/pull/7)) if the model classifies it as safe.

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
        with:
          approvePullRequests: "true"
          labelPullRequestsWhenApproved: "true"
          labelPullRequestsWhenReviewNeeded: "false"
          failJobsWhenReviewNeeded: "false"
```

2. 🎉 That's it! Codeball will now run on new Pull Requests, and will approve the PR if it's a good one!

## Customizations

Codeball Actions are built on multiple smaller building-blocks, that are heavily configurable through GitHub Actions. Here's a few examples:

_If you're using Codeball in another way, please let us know in an issue!_

### Example: "Dry-run" mode, labels all PRs with the Codeball Result

<details>
  <summary>▶️ codeball-dry-run.yml</summary>
  
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
        with:
          approvePullRequests: "false"
          labelPullRequestsWhenApproved: "true"
          labelPullRequestsWhenReviewNeeded: "true"
          failJobsWhenReviewNeeded: "false"
```
</details>

### Example: Approve only (no labels)

<details>
  <summary>▶️ codeball-approve.yml</summary>
  
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
        with:
          approvePullRequests: "true"
          labelPullRequestsWhenApproved: "false"
          labelPullRequestsWhenReviewNeeded: "false"
          failJobsWhenReviewNeeded: "false"
```
</details>


### Example: Filter files (run only for PRs modifying a single service)

<details>
  <summary>▶️ codeball-filter-files.yml</summary>
  
```yaml
name: Codeball
on:
  pull_request:
    # Run Codeball only if files under "/web/" has been modified (and no other files)
    # See: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#example-including-and-excluding-paths
    paths:
      - '!**'
      - '/web/**'

jobs:
  codeball_job:
    runs-on: ubuntu-latest
    name: Codeball
    steps:
      - name: Codeball
        uses: sturdy-dev/codeball-action@v2
        with:
          approvePullRequests: "true"
          labelPullRequestsWhenApproved: "true"
          labelPullRequestsWhenReviewNeeded: "false"
          failJobsWhenReviewNeeded: "false"
```
</details>


### Example: Fail the Codeball Action (❌) if Codeball does not approve the contribution

<details>
  <summary>▶️ codeball-fail-not-approved.yml</summary>

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
        with:
          approvePullRequests: "true"
          labelPullRequestsWhenApproved: "true"
          labelPullRequestsWhenReviewNeeded: "false"
          failJobsWhenReviewNeeded: "true"
```
</details>


## Building Blocks

The Codeball sub-actions are:

* [`sturdy-dev/codeball-action/baller/@v2`](./baller/README.md) – Triggers new Codeball Jobs
* [`sturdy-dev/codeball-action/status/@v2`](./status/README.md) – Waits for the the Codeball result
* [`sturdy-dev/codeball-action/approver/@v2`](./approver/README.md) – Approves PRs
* [`sturdy-dev/codeball-action/labeler/@v2`](./labeler/README.md) – Adds labels to PRs

## How Codeball works

Codeball uses a deep learning model that has been trained on over 1 million Pull Requests. For each contribution it considers in hundreds of inputs, including:

- The code diffs (perceptual hashes)
- The author's recent experience with the affected files
- The change frequency of the affected files
- Past code reversals / fix-ups

Codeball is optimized for precision, which means it only approves contributions that it's really confident in.

## Troubleshooting

### Permissions

Codeball works out of the box with GitHub Actions. 

If you're using non-default permissions, or want to use a custom access token. Make sure that you're running Codeball with the following permissions:

```yaml
permissions:
  contents: read
  issues: write
  pull-requests: write
```

### Forks and private repositories

By default, pull requests from a fork does not have "write" permissions when running in GitHub Actions, and those Pull Requests can not be approved or labeled.

If you're using forks from a private repository, and want to use Codeball on Pull Requests created from a fork.  Enable "Send write tokens to workflows from fork pull requests" on the repository ([docs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository#enabling-workflows-for-private-repository-forks)).

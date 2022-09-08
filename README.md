![Codeball](https://user-images.githubusercontent.com/47952/173048697-d3d39fc3-6238-4fc3-9baf-ccbbb3b4258c.png)

[![Discord](https://img.shields.io/badge/join-Discord-blue.svg)](https://discord.gg/nE4UcQHZtV)


# 🔮 Codeball &mdash; AI Code Review 

Codeball is a code review AI that scores Pull Requests on a grade from 0 _(needs careful review)_ to 1 _(you should merge this!)_

Use Codeball to add labels to help you focus, to auto approve PRs, and more. The Codeball action is easy to use (sane defaults), and is highly customizeable to fit your workflow when needed.

🏷 Labels PRs when you should **review with caution**  – Stay sharp, don't let the bugs pass through!

✅ Identifies and **approves** or labels safe PRs – Save time by fast-tracking PRs that are easy to review

🏖 **Great defaults**, fully customizable and programmable with GitHub Actions  

## GitHub Action

The Codeball GitHub Action runs [Codeball](https://codeball.ai/) on all new Pull Requests, and approves the Pull Request ([example](https://github.com/sturdy-dev/codeball-action/pull/7)) if the model classifies it as safe.

- [Online Demo](https://codeball.ai/)
- [How Codeball Works](https://codeball.ai/how)

## Quick Start

1. Create a new file called `.github/workflows/codeball.yml` with the following content:

```yaml
name: Codeball
on:
  pull_request: {}
  pull_request_review_comment:
    types: [created, edited]

jobs:
  codeball_job:
    runs-on: ubuntu-latest
    name: Codeball
    steps:
      - name: Codeball
        uses: sturdy-dev/codeball-action@v2
        with:
          # For all configuration options see https://github.com/sturdy-dev/codeball-action/blob/v2/action.yml
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

### Example: Skip Draft pull requests

<details>
  <summary>▶️ skip-drafts.yml</summary>

```yaml
name: Codeball
on:
  pull_request:
     types:
     - opened
     - reopened
     - synchronize
     - ready_for_review

jobs:
  codeball_job:
    runs-on: ubuntu-latest
    if: ${{ !github.event.pull_request.draft }}
    name: Codeball
    steps:
      - name: Codeball
        uses: sturdy-dev/codeball-action@v2
```
</details>



## Building Blocks

The Codeball sub-actions are:

* [`sturdy-dev/codeball-action/baller/@v2`](./baller/README.md) – Triggers new Codeball Jobs
* [`sturdy-dev/codeball-action/status/@v2`](./status/README.md) – Waits for the the Codeball result
* [`sturdy-dev/codeball-action/approver/@v2`](./approver/README.md) - Approves PRs
* [`sturdy-dev/codeball-action/labeler/@v2`](./labeler/README.md) – Adds labels to PRs
* [`sturdy-dev/codeball-action/suggester/@v2`](./suggester/README.md) – Converts comments to code suggestions

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

To allow PR approvals, make sure that **"Allow GitHub Actions to Create and Approve Pull Requests"** is enabled in the repository and organization settings on GitHub (under "Settings > Actions > General").

<details>
  <summary>Show recommended GitHub Permissions</summary>
  
  ![Fork pull request workflows from outside collaborators](https://user-images.githubusercontent.com/47952/184130867-8c149bfa-e827-425c-882b-eacf775c9542.png)
![Fork pull request workflows in private repositories](https://user-images.githubusercontent.com/47952/184130872-7e91445d-4287-4b80-8c3b-6ff40fc893db.png)
![Workflow permissions](https://user-images.githubusercontent.com/47952/184130874-54458e54-84f4-48fb-9347-0188c3ba27b6.png)
</details>

If you can not (or do not want to) update the org and repo settings for GitHub Actions, install the ["Codeball AI Writer"](https://github.com/apps/codeball-ai-writer) GitHub App on the repository. When installed, Codeball will use the permissions granted via the app instead of the GitHub Actions token.

### Forks and public repositories

GitHub does not offer (and reasonably so) a way for Pull Requests from a fork to a public repository to run with "write" permissions to the parent repository.

If you want to use Codeball on a public repository, install the ["Codeball AI Writer"](https://github.com/apps/codeball-ai-writer) app on the parent repository. This allows the Codeball Action to use the permissions from the app as a fallback if the action is running without write permissions.

### Forks and private repositories

By default, Pull Requests from a fork does not have "write" permissions when running in GitHub Actions, and those Pull Requests can not be approved or labeled.

The easiest workaround to this issue is to install the ["Codeball AI Writer"](https://github.com/apps/codeball-ai-writer) app (see instructions for how to use Codeball on a public repository).

Alternatively, you can enable "Send write tokens to workflows from fork pull requests" on the repository ([docs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository#enabling-workflows-for-private-repository-forks)) via GitHub.

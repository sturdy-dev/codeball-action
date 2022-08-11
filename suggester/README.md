# Codeball Suggester

This action adds suggestions on the Pull Request.

# Inputs

## `codeball-job-id` (optional)

The ID of the Codeball Job created by the Baller Action

## `GITHUB_TOKEN` (optional)

Default to {{ github.token }}. This is the default GitHub token available to actions and is used to run Codeball and to post the result. The default token permissions (https://docs.github.com/en/actions/learn-github-actions/workflow-syntax-for-github-actions#permissions) work fine.

Default: `'${{ github.token }}'`

# Outputs

_This action has no outputs_

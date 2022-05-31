# Codeball Baller

This action starts a new asynchronous Codeball Job.

# Inputs

## `GITHUB_TOKEN` (optional)

Default to {{ github.token }}. This is the default GitHub token available to actions and is used to run Codeball and to post the result. The default token permissions (https://docs.github.com/en/actions/learn-github-actions/workflow-syntax-for-github-actions#permissions) work fine.

Default: `'${{ github.token }}'`

# Outputs

## `codeball-job-id`

ID of the Codeball Job

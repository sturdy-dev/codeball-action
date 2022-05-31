# Codeball Approver

This action approves a Pull Request with a message.

# Inputs

## `GITHUB_TOKEN` (optional)

Default to {{ github.token }}. This is the default GitHub token available to actions and is used to run Codeball and to post the result. The default token permissions (https://docs.github.com/en/actions/learn-github-actions/workflow-syntax-for-github-actions#permissions) work fine.

Default: `'${{ github.token }}'`

## `message` (optional)

The message to send in the code review comment.

Default: `"Codeball: LGTM! :+1:"`

# Outputs

_This action has no outputs_

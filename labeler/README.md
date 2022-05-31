# Codeball Labeler

This action sets labels on the Pull Request.

# Inputs

## `GITHUB_TOKEN` (optional)

Default to {{ github.token }}. This is the default GitHub token available to actions and is used to run Codeball and to post the result. The default token permissions (https://docs.github.com/en/actions/learn-github-actions/workflow-syntax-for-github-actions#permissions) work fine.

Default: `'${{ github.token }}'`

## `name` (required)

The name of the label to set. If no label with this name exists, it will be created.

## `color` (optional)

The color of the label.

Default: `"008E43"`

## `description` (optional)

The description of the label.

Default: `"Codeball"`

# Outputs

_This action has no outputs_

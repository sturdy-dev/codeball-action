# Codeball Status

This action waits for the Job to complete, and outputs the result.

# Inputs

## `codeball-job-id` (required)

The ID of the Codeball Job created by the Baller Action

# Outputs

## `jobType`

`"contribution"` or `"comment`

## `approved`

If the Codeball approved the contribution (true or false)

## `suggested`

If the Codeball has suggestions for the contribution (true or false)

## `confidence`

The Codeball confidence that this contribution can be approved as-is. A number between 0 and 1. A value between 0 and 0.3 normally indicates that the contribution should be thoroughly reviewed. A value above 0.93 indicates that the contribution is very likely to be approved as-is.

Confidence is only set for contribution jobs.
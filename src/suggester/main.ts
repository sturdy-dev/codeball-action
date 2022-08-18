import * as core from '@actions/core'
import * as github from '@actions/github'
import {RequestError} from '@octokit/request-error'
import {track} from '../lib/track'
import {suggest} from '../lib/github'
import {get} from '../lib/jobs'
import {Octokit, required} from '../lib'
import {ForbiddenError} from '../lib/api'

const jobID = required('codeball-job-id')
const githubToken = required('GITHUB_TOKEN')
const octokit = new Octokit({auth: githubToken})

const run = async (): Promise<void> => {
  const pullRequestURL = github.context.payload?.pull_request?.html_url
  if (!pullRequestURL) throw new Error('No pull request URL found')

  const pullRequestNumber = github.context.payload?.pull_request?.number
  if (!pullRequestNumber) throw new Error('No pull request number found')

  const repoOwner = github.context.payload.repository?.owner.login
  if (!repoOwner) throw new Error('No repo owner found')

  const repoName = github.context.payload.repository?.name
  if (!repoName) throw new Error('No repo name found')

  const pr = await octokit.pulls
    .get({
      owner: repoOwner,
      repo: repoName,
      pull_number: pullRequestNumber
    })
    .then(r => r.data)

  const isPrivate = pr.base.repo.private
  const isFromFork = pr.head.repo?.fork
  const isToFork = pr.base.repo.fork

  suggestViaGitHub({
    owner: repoOwner,
    repo: repoName,
    pull_number: pullRequestNumber
  }).catch(async error => {
    if (
      error instanceof Error &&
      error.message === 'Resource not accessible by integration'
    ) {
      return suggestViaAPI({link: pullRequestURL}).catch(error => {
        if (error.name === ForbiddenError.name) {
          throw new Error(
            !isPrivate && isFromFork && !isToFork
              ? 'Codeball Suggester failed to access GitHub. Install https://github.com/apps/codeball-ai-writer to the base repository to give Codeball permission to comment on Pull Requests.'
              : 'Codeball Suggester failed to access GitHub. Check the "GITHUB_TOKEN Permissions" of this job and make sure that the job has WRITE permissions to Pull Requests.'
          )
        }
        throw error
      })
    } else {
      core.debug(`run: unexpected error: ${typeof error}`)
      throw error
    }
  })
}

type requestError = {
  message: string
  errors: {
    resource: string
    message: string
  }[]
}

const isSuggestionOutsideOfHunkError = (error: RequestError): boolean => {
  const data = error.response?.data as requestError
  if (
    data.message === 'Validation Failed' &&
    data.errors.some(
      e =>
        e.message === 'pull_request_review_thread.line must be part of the diff'
    )
  ) {
    return true
  }
  return false
}

const suggestViaGitHub = async ({
  owner,
  repo,
  pull_number
}: {
  owner: string
  repo: string
  pull_number: number
}) =>
  get(jobID).then(async job => {
    let suggestions = job?.comment?.suggestions
    if (!suggestions) return
    if (suggestions.length === 0) return

    const existingComments = await octokit.pulls
      .listReviewComments({
        owner,
        repo,
        pull_number
      })
      .then(r => r.data)

    suggestions.forEach(suggestion => {
      const request = {
        owner,
        repo,
        pull_number,
        commit_id: suggestion.commit_id,
        body:
          'Suggestion from [Codeball](https://codeball.ai/) _(beta)_\n\n```suggestion\n' +
          suggestion.text +
          '```\n',
        path: suggestion.filename
      } as {
        owner: string
        repo: string
        pull_number: number
        commit_id: string
        body: string
        path: string
        start_line?: number
        side?: 'LEFT' | 'RIGHT'
        line?: number
        start_side?: 'LEFT' | 'RIGHT'
      }

      const isSuggestionMultiline = suggestion.from_line !== suggestion.to_line
      if (isSuggestionMultiline) {
        request.start_line = suggestion.from_line
        request.start_side = 'RIGHT'

        request.line = suggestion.to_line
        request.side = 'RIGHT'
      } else {
        request.line = suggestion.from_line
        request.side = 'RIGHT'
      }

      const alreadyExists = existingComments.some(comment => {
        const isSameBody = comment.body === request.body
        const isSameStartLineLine = comment.start_line === request.start_line
        const isSameEndLine = comment.line === request.line
        const isSame = isSameBody && isSameStartLineLine && isSameEndLine
        return isSame
      })

      if (alreadyExists) return

      const inReplyTo = existingComments.find(comment => {
        if (!comment.line) return false

        const isGithubCommentMultiline = !!comment.start_line

        if (!isSuggestionMultiline && !isGithubCommentMultiline)
          return suggestion.from_line === comment.line

        if (isGithubCommentMultiline && isGithubCommentMultiline)
          return (
            suggestion.from_line === comment.start_line &&
            suggestion.to_line === comment.line
          )

        return false
      })

      if (inReplyTo) {
        const replyRequest = {
          owner,
          repo,
          pull_number,
          body: request.body,
          comment_id: inReplyTo.id
        }

        core.debug(
          `creating reply review comment ${JSON.stringify(replyRequest)}`
        )
        octokit.pulls.createReplyForReviewComment(replyRequest).catch(error => {
          core.debug(
            'createReplyForReviewComment failed: ' + JSON.stringify(error)
          )
          throw error
        })
      } else {
        core.debug(`creating review comment ${JSON.stringify(request)}`)
        octokit.pulls
          .createReviewComment(request)
          .catch((error: RequestError) => {
            if (isSuggestionOutsideOfHunkError(error)) {
              core.warning(
                "Tried to make a suggestion to a line outside of the PR's hunk, skipping"
              )
              return
            }

            core.debug('createReviewComment failed: ' + JSON.stringify(error))
            throw error
          })
      }
    })
  })

const suggestViaAPI = ({link}: {link: string}) => suggest({link})

run()
  .then(async () => await track({jobID, actionName: 'suggester'}))
  .catch(async error => {
    if (error instanceof Error) {
      await track({jobID, actionName: 'suggester', error: error.message})
      core.setFailed(error.message)
    }
  })

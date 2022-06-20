import * as core from '@actions/core'
import * as github from '@actions/github'
import {Octokit, optional, required} from '../lib'
import {ForbiddenError} from '../lib/api'
import {approve} from '../lib/github'
import {track} from '../lib/track'

const jobID = optional('codeball-job-id')

async function run(): Promise<void> {
  const pullRequestURL = github.context.payload?.pull_request?.html_url
  if (!pullRequestURL) throw new Error('No pull request URL found')

  const pullRequestNumber = github.context.payload?.pull_request?.number
  if (!pullRequestNumber) throw new Error('No pull request number found')

  const commitId = github.context.payload.pull_request?.head.sha
  if (!commitId) throw new Error('No commit ID found')

  const repoOwner = github.context.payload.repository?.owner.login
  if (!repoOwner) throw new Error('No repo owner found')

  const repoName = github.context.payload.repository?.name
  if (!repoName) throw new Error('No repo name found')

  const githubToken = required('GITHUB_TOKEN')
  const message = required('message')

  const octokit = new Octokit({auth: githubToken})

  const dashboardLink = `[dashboard](https://codeball.ai/${process.env.GITHUB_REPOSITORY})`
  const reviewMessage = `${message} ${dashboardLink}`

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

  await octokit.pulls
    .createReview({
      owner: repoOwner,
      repo: repoName,
      pull_number: pullRequestNumber,
      commit_id: commitId,
      body: reviewMessage,
      event: 'APPROVE'
    })
    .catch(async error => {
      if (
        error instanceof Error &&
        error.message === 'Resource not accessible by integration'
      ) {
        // If the token is not allowed to create reviews (for example it's a pull request from a public fork),
        // we can try to approve the pull request from the backend with the app token.
        return approve({
          link: pullRequestURL,
          message: reviewMessage
        }).catch(error => {
          if (error.name === ForbiddenError.name) {
            throw new Error(
              !isPrivate && isFromFork && !isToFork
                ? 'Codeball Approver failed to access GitHub. Install https://github.com/apps/codeball-ai-writer to the base repository to give Codeball permission to approve Pull Requests.'
                : 'Codeball Approver failed to access GitHub. Check the "GITHUB_TOKEN Permissions" of this job and make sure that the job has WRITE permissions to Pull Requests.'
            )
          }
        })
      } else {
        throw error
      }
    })
}

run()
  .then(async () => await track({jobID, actionName: 'approver'}))
  .catch(async error => {
    if (error instanceof Error) {
      await track({jobID, actionName: 'approver', error: error.message})
      core.setFailed(error.message)
    }
  })

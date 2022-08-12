import * as core from '@actions/core'
import * as github from '@actions/github'
import {features, Octokit, optional, required} from '../lib'
import {ForbiddenError} from '../lib/api'
import {approve} from '../lib/github'
import {track} from '../lib/track'
import {list as listMessages} from '../lib/jobs/messages'

const jobID = optional('codeball-job-id')

const defaultMessages = [
  required('message'),
  '<hr />',
  `[dashboard](https://codeball.ai/${process.env.GITHUB_REPOSITORY})`
]

const getServerSideMessages = (jobId: string) =>
  listMessages(jobId).then(messages => [
    required('message'),
    '<hr />',
    ...messages.map(message => message.text)
  ])

const getMessages = (jobId: string | undefined) =>
  jobId
    ? getServerSideMessages(jobId).catch(() => defaultMessages)
    : defaultMessages

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
  const octokit = new Octokit({auth: githubToken})

  const reviewMessage = (await getMessages(jobID)).join('\n\n')

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

  const feats = await features({jobID})

  if (!feats.approve) {
    core.error(
      'Unable to run this action as the feature is not available for your organization. Please upgrade your Codeball plan, or contact support@codeball.ai'
    )
    return
  }

  await octokit.pulls
    .createReview({
      owner: repoOwner,
      repo: repoName,
      pull_number: pullRequestNumber,
      commit_id: commitId,
      body: reviewMessage,
      event: feats.approve ? 'APPROVE' : 'COMMENT'
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
          throw error
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

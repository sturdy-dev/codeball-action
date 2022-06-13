import * as core from '@actions/core'
import * as github from '@actions/github'
import {Octokit, optional, required} from '../lib'
import {track} from '../lib/track/track'

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

  const octokit = new Octokit({auth: githubToken})

  const dashboardLink = '[dashboard](https://codeball.ai/' + process.env.GITHUB_REPOSITORY + ')'

  await octokit.pulls.createReview({
    owner: repoOwner,
    repo: repoName,
    pull_number: pullRequestNumber,
    commit_id: commitId,
    body: 'Codeball: LGTM! :+1: ' + '(' + dashboardLink + ')',
    event: 'APPROVE'
  })
}

run()
  .then(async () => await track({jobID, actionName: 'approver'}))
  .catch(error => {
    if (error instanceof Error) {
      track({jobID, actionName: 'approver', error: error.message})
      if (error.message === 'Resource not accessible by integration') {
        core.setFailed(
          'Codeball Approver failed to access GitHub. Check the "GITHUB_TOKEN Permissions" of this job and make sure that the job has WRITE permissions to Pull Requests.'
        )
      } else {
        core.setFailed(error.message)
      }
    }
  })

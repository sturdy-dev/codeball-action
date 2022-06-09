import core from '@actions/core'
import github from '@actions/github'
import {Octokit, optional, required} from '../lib'
import {track} from '../lib/track/track'

async function run(): Promise<void> {
  try {
    const pullRequestURL = github.context.payload?.pull_request?.html_url
    if (!pullRequestURL) {
      throw new Error('No pull request URL found')
    }

    const pullRequestNumber = github.context.payload?.pull_request?.number
    if (!pullRequestNumber) {
      throw new Error('No pull request number found')
    }

    const commitId = github.context.payload.pull_request?.head.sha
    if (!commitId) {
      throw new Error('No commit ID found')
    }

    const repoOwner = github.context.payload.repository?.owner.login
    if (!repoOwner) {
      throw new Error('No repo owner found')
    }

    const repoName = github.context.payload.repository?.name
    if (!repoName) {
      throw new Error('No repo name found')
    }

    const githubToken = required('GITHUB_TOKEN')

    const jobID = optional('codeball-job-id')

    const octokit = new Octokit({auth: githubToken})

    await octokit.pulls.createReview({
      owner: repoOwner,
      repo: repoName,
      pull_number: pullRequestNumber,
      commit_id: commitId,
      body: 'Codeball: LGTM! :+1:',
      event: 'APPROVE'
    })

    track({jobID, actionName: 'approver'})
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Resource not accessible by integration') {
        core.error(
          'Codeball Approver failed to access GitHub. Check the "GITHUB_TOKEN Permissions" of this job and make sure that the job has WRITE permissions to Pull Requests.'
        )
        core.error(error)
      } else {
        core.setFailed(error.message)
      }
    }
  }
}

run()

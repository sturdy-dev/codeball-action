import * as core from '@actions/core'
import * as github from '@actions/github'
import {Octokit, optional, required} from '../lib'
import {track} from '../lib/track/track'

const jobID = optional('codeball-job-id')

const run = async (): Promise<void> => {
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

  const labelName = required('name')
  const labelColor = required('color')
  const labelDescription = required('description')

  const octokit = new Octokit({auth: githubToken})

  core.debug(`Adding label "${labelName}" to PR ${pullRequestURL}`)

  const existingLabels = await octokit.issues.listLabelsForRepo({
    owner: repoOwner,
    repo: repoName
  })

  let haveLabel = false
  for (const label of existingLabels.data) {
    if (label.name === labelName) {
      haveLabel = true
      break
    }
  }

  if (!haveLabel) {
    core.info(`Label "${labelName}" does not exist, creating it now`)

    const createLabelParams = {
      owner: repoOwner,
      repo: repoName,
      name: labelName,
      color: labelColor,
      description: labelDescription
    }

    core.debug(`Create label: ${JSON.stringify(createLabelParams)}`)
    await octokit.issues.createLabel(createLabelParams)
  } else {
    core.debug(`Label "${labelName}" already exists, will not create it`)
  }

  const addLabelParams = {
    owner: repoOwner,
    repo: repoName,
    issue_number: pullRequestNumber,
    labels: [labelName]
  }

  core.debug(`Add label: ${JSON.stringify(addLabelParams)}`)
  await octokit.issues.addLabels(addLabelParams)
}

run()
  .then(async () => await track({jobID, actionName: 'labeler'}))
  .catch(async error => {
    if (error instanceof Error) {
      await track({jobID, actionName: 'labeler', error: error.message})
      if (error.message === 'Resource not accessible by integration') {
        core.setFailed(
          'Codeball Labeler failed to access GitHub. Check the "GITHUB_TOKEN Permissions" of this job and make sure that the job has WRITE permissions to Pull Requests.'
        )
      } else {
        core.setFailed(error.message)
      }
    }
  })

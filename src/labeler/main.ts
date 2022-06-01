import * as core from '@actions/core'
import * as github from '@actions/github'
import {Octokit} from '../lib'
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

    const githubToken = core.getInput('GITHUB_TOKEN')
    if (!githubToken) {
      core.setFailed('No GITHUB_TOKEN found')
      return
    }

    const labelName = core.getInput('name')
    const labelColor = core.getInput('color')
    const labelDescription = core.getInput('description')

    const jobID = core.getInput('codeball-job-id') // jobID is not required

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

    await track(jobID, 'labeler')
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Resource not accessible by integration') {
        core.error(
          'Codeball Labeler failed to access GitHub. Check the "GITHUB_TOKEN Permissions" of this job and make sure that the job has WRITE permissions to Pull Requests.'
        )
        core.error(error)
      } else {
        core.setFailed(error.message)
      }
    }
  }
}

run()

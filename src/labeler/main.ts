import * as core from '@actions/core'
import * as github from '@actions/github'
import {Octokit, optional, required, features} from '../lib'
import {label as labelViaAPI} from '../lib/github'
import {ForbiddenError} from '../lib/api'
import {track} from '../lib/track'

const jobID = optional('codeball-job-id')

const githubToken = required('GITHUB_TOKEN')
const octokit = new Octokit({auth: githubToken})

const labelViaGithub = async ({
  labelName,
  pullRequestURL,
  repoName,
  repoOwner,
  labelColor,
  labelDescription,
  pullRequestNumber,
  removeLabelNames
}: {
  labelName: string
  pullRequestURL: string
  repoOwner: string
  repoName: string
  labelColor: string
  labelDescription: string
  pullRequestNumber: number
  removeLabelNames: string[]
}) => {
  core.debug(`Adding label "${labelName}" to PR ${pullRequestURL}`)

  const labelsForRepo = await octokit.issues.listLabelsForRepo({
    owner: repoOwner,
    repo: repoName
  })

  const labelsForRepoSet = new Set(labelsForRepo.data.map(label => label.name))

  if (!labelsForRepoSet.has(labelName)) {
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

  if (removeLabelNames.length > 0) {
    const labelsOnIssue = await octokit.issues.listLabelsOnIssue({
      owner: repoOwner,
      repo: repoName,
      issue_number: pullRequestNumber
    })

    const labelsOnIssueSet = new Set(
      labelsOnIssue.data.map(label => label.name)
    )

    for (const name of removeLabelNames) {
      if (!labelsOnIssueSet.has(name)) {
        core.info(
          `Label "${name}" is not set on this issue, will not remove it`
        )
        continue
      }

      const removeLabelParams = {
        owner: repoOwner,
        repo: repoName,
        issue_number: pullRequestNumber,
        name
      }
      core.debug(`Remove label: ${JSON.stringify(removeLabelParams)}`)
      await octokit.issues.removeLabel(removeLabelParams)
    }
  }
}

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

  const labelName = required('name')
  const labelColor = required('color')
  const labelDescription = required('description')
  const removeLabelNames = optional('remove-label-names')

  const feats = await features({jobID})
  if (!feats.label) {
    core.error(
      'Unable to run this action as the feature is not available for your organization. Please upgrade your Codeball plan, or contact support@codeball.ai'
    )
    return
  }

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

  await labelViaGithub({
    pullRequestURL,
    repoName,
    repoOwner,
    labelName,
    labelColor,
    labelDescription,
    pullRequestNumber,
    removeLabelNames: removeLabelNames ? removeLabelNames.split(',') : []
  }).catch(async error => {
    if (
      error instanceof Error &&
      error.message === 'Resource not accessible by integration'
    ) {
      // If the token is not allowed to create labels (for example it's a pull request from a public fork),
      // we can try to label the pull request from the backend with the app token.
      return labelViaAPI({
        link: pullRequestURL,
        set: labelName,
        description: labelDescription,
        color: labelColor,
        remove: removeLabelNames ? removeLabelNames.split(',') : []
      }).catch(error => {
        if (error.name === ForbiddenError.name) {
          throw new Error(
            !isPrivate && isFromFork && !isToFork
              ? 'Codeball Labler failed to access GitHub. Install https://github.com/apps/codeball-ai-writer to the base repository to give Codeball permission to label Pull Requests.'
              : 'Codeball Labler failed to access GitHub. Check the "GITHUB_TOKEN Permissions" of this job and make sure that the job has WRITE permissions to Pull Requests.'
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
  .then(async () => await track({jobID, actionName: 'labeler'}))
  .catch(async error => {
    if (error instanceof Error) {
      await track({jobID, actionName: 'labeler', error: error.message})
      core.setFailed(error.message)
    }
  })

import fetch from 'node-fetch'
import {Job} from './types'
import {isContributionJob, isFinalStatus} from './utils'
import core from '@actions/core'
import github from '@actions/github'
import {Octokit} from '@octokit/action'

async function getJob(id: string): Promise<Job> {
  const res = await fetch(`https://api.codeball.ai/jobs/${id}`)
  const data = (await res.json()) as Job
  return data
}

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

    const jobID = core.getInput('codeball-job-id')
    const doApprove = core.getInput('do-approve') === 'true'
    const doLabel = core.getInput('do-label') === 'true'
    const labelValue = core.getInput('label')

    core.info(`Job ID: ${jobID}`)
    core.info(`Do approve: ${doApprove}`)
    core.info(`Do label: ${doLabel}`)

    let job = await getJob(jobID)
    let attempts = 0
    const maxAttempts = 30
    while (attempts < maxAttempts && !isFinalStatus(job.status)) {
      attempts++
      core.info(
        `Waiting for job ${jobID} to complete... (${attempts}/${maxAttempts})`
      )
      await new Promise(resolve => setTimeout(resolve, 5000))
      job = await getJob(jobID)
    }

    if (!isFinalStatus(job.status)) {
      throw new Error(`Job ${jobID} is not finished`)
    }

    if (!isContributionJob(job)) {
      throw new Error(`Job ${jobID} is not a contribution job`)
    }

    const approved = job.contribution?.result === 'approved'

    const octokit = new Octokit()
    if (approved) {
      core.info(`Job ${jobID} is approved, approving the PR now!`)

      if (doLabel) {
        core.debug(`Adding label to PR ${pullRequestURL}`)
        await octokit.issues.addLabels({
          owner: github.context.repo.owner,
          repo: github.context.repo.repo,
          issue_number: pullRequestNumber,
          labels: [labelValue]
        })
      }

      if (doApprove) {
        core.debug(`Approving PR ${pullRequestURL}`)
        await octokit.pulls.createReview({
          owner: github.context.repo.owner,
          repo: github.context.repo.repo,
          pull_number: pullRequestNumber,
          commit_id: commitId,
          body: 'Codeball: LGTM! :+1:',
          event: 'APPROVE'
        })
      }
    } else {
      core.info(`Job ${jobID} is not approved, will not approve the PR`)
    }

    await core.summary
      .addHeading('Codeball')
      .addTable([
        [
          {data: 'Pull Request', header: true},
          {data: 'Result', header: true}
        ],
        [`#${pullRequestNumber}`, approved ? 'Approved ✅' : 'Not approved']
      ])
      .addLink('View on web', `https://codeball.ai/prediction/${jobID}`)
      .write()
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()

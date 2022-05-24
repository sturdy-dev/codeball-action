import fetch from 'node-fetch'
import {Job} from './types'
import {isContributionJob, isFinalStatus} from './utils'

async function getJob(id: string): Promise<Job> {
  const res = await fetch(`https://api.codeball.forfunc.com/jobs/${id}`)
  const data = (await res.json()) as Job
  return data
}

async function run(): Promise<void> {
  const core = require('@actions/core')

  try {
    const github = require('@actions/github')
    const {Octokit} = require('@octokit/action')

    const pullRequestURL = github.context.payload?.pull_request?.html_url

    if (!pullRequestURL) {
      core.setFailed('No pull request URL found')
      return
    }

    const jobID = core.getInput('codeball-job-id')
    core.info(`Job ID: ${jobID}`)

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
      core.setFailed(`Job ${jobID} is not finished`)
      return
    }

    if (!isContributionJob(job)) {
      core.setFailed(`Job ${jobID} is not a contribution job`)
      return
    }

    const approved = job.contribution?.result === 'approved'

    if (approved) {
      core.info(`Job ${jobID} is approved, approving the PR now!`)

      const octokit = new Octokit()

      await octokit.request(
        'POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews',
        {
          owner: github.context.payload.organization.login,
          repo: github.context.payload.repository.name,
          pull_number: github.context.payload.pull_request.number,
          commit_id: github.context.payload.pull_request.head.sha,
          body: 'Codeball: LGTM! :+1:',
          event: 'APPROVE'
        }
      )
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
        [
          `#${github.context.payload.pull_request.number}`,
          approved ? 'Approved ✅' : 'Not approved'
        ]
      ])
      .addLink(
        'View on web',
        `https://codeball.forfunc.com/prediction/${jobID}`
      )
      .write()
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()

import {isContributionJob, isFinalStatus, get} from '../lib'
import * as core from '@actions/core'

async function run(): Promise<void> {
  try {
    const jobID = core.getInput('codeball-job-id')
    if (!jobID) {
      throw new Error('No job ID found')
    }

    core.info(`Job ID: ${jobID}`)

    let job = await get(jobID)
    let attempts = 0
    const maxAttempts = 60
    while (attempts < maxAttempts && !isFinalStatus(job.status)) {
      attempts++
      core.info(
        `Waiting for job ${jobID} to complete... (${attempts}/${maxAttempts})`
      )
      await new Promise(resolve => setTimeout(resolve, 5000))
      job = await get(jobID)
    }

    if (!isFinalStatus(job.status)) {
      core.setOutput('approved', false)
      return
    }

    if (!isContributionJob(job)) {
      core.setOutput('approved', false)
      return
    }

    const approved = job.contribution?.result === 'approved'

    if (approved) {
      core.setOutput('approved', true)
      return
    }

    core.setOutput('approved', false)
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

run()

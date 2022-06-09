import {isContributionJob, isFinalStatus, get, required, Job} from '../lib'
import core from '@actions/core'
import {track} from '../lib/track/track'

const isApproved = (job: Job): boolean =>
  isFinalStatus(job.status) &&
  isContributionJob(job) &&
  job.contribution?.result === 'approved'

async function run(): Promise<void> {
  try {
    const jobID = required('codeball-job-id')

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

    core.setOutput('approved', isApproved(job))

    track({jobID, actionName: 'status'})
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

run()

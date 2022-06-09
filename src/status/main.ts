import {isContributionJob, isFinalStatus, get, required, Job} from '../lib'
import core from '@actions/core'
import {track} from '../lib/track/track'

const isApproved = (job: Job): boolean =>
  isFinalStatus(job.status) &&
  isContributionJob(job) &&
  job.contribution?.result === 'approved'

const run = async (jobID: string): Promise<boolean> => {
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

  return isApproved(job)
}

const jobID = required('codeball-job-id')

run(jobID)
  .then(isApproved => {
    track({jobID, actionName: 'status'})
    core.setOutput('approved', isApproved)
  })
  .catch(error => {
    if (error instanceof Error) {
      track({jobID, actionName: 'status', error: error.message})
      core.setFailed(error.message)
    }
  })

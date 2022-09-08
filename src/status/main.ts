import {
  get,
  isCommentJob,
  isContributionJob,
  isFinalStatus,
  Job,
  required
} from '../lib'
import * as core from '@actions/core'
import {track} from '../lib/track'

const isSuggested = (job: Job) =>
  isFinalStatus(job.status) &&
  !!job.comment &&
  job.comment?.suggestions?.length > 0

const isApproved = (job: Job): boolean =>
  isFinalStatus(job.status) &&
  isContributionJob(job) &&
  job.contribution?.result === 'approved'

const getJobType = (job: Job): string => {
  if (isContributionJob(job)) {
    return 'contribution'
  }
  if (isCommentJob(job)) {
    return 'comment'
  }
  return 'unknown'
}

const getConfidence = (job: Job): number => {
  if (isContributionJob(job)) {
    const probabilities =
      job.contribution?.predicted_outcome?.file_probabilities

    if (probabilities) {
      return Math.min(...probabilities)
    }

    return 0
  }

  return 0
}

const run = async (
  jobID: string
): Promise<{
  isApproved: boolean
  isSuggested: boolean
  jobType: string
  confidence: number
}> => {
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

  return {
    isApproved: isApproved(job),
    isSuggested: isSuggested(job),
    jobType: getJobType(job),
    confidence: getConfidence(job)
  }
}

const jobID = required('codeball-job-id')

run(jobID)
  .then(async ({isApproved, isSuggested, jobType, confidence}) => {
    await track({jobID, actionName: 'status'})
    core.setOutput('approved', isApproved)
    core.setOutput('suggested', isSuggested)
    core.setOutput('jobType', jobType)
    core.setOutput('confidence', confidence.toFixed(3))
  })
  .catch(async error => {
    if (error instanceof Error) {
      await track({jobID, actionName: 'status', error: error.message})
      core.setFailed(error.message)
    }
  })

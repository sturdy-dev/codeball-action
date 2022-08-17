import type {Status, Job} from './types'

export const isFinalStatus = (st: Status): Boolean =>
  st === 'failure' || st === 'success'

export const isContributionJob = (job: Job): Boolean =>
  job.contribution !== undefined

export const isCommentJob = (job: Job): Boolean => job.comment !== undefined

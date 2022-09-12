import {get as apiGET, post} from '../api'
import type {Job} from './types'

export const get = (id: string): Promise<Job> => apiGET(`/jobs/${id}`)

export const create = ({
  url,
  access_token,
  thresholds
}: {
  url: string
  access_token: string
  thresholds: {
    approve: number
    careful_review: number
  }
}): Promise<Job> => post('/jobs', {url, access_token, thresholds})

export const list = (params: {
  organization?: string
  repository?: string
  onlyRootJobs?: string
  limit?: string
}): Promise<{jobs: Job[]; next?: string}> =>
  apiGET('/jobs', new URLSearchParams(params))

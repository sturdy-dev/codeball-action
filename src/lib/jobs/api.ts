import {get as apiGET, post} from '../api'
import type {Job} from './types'

export const get = (id: string): Promise<Job> => apiGET(`/jobs/${id}`)

export const create = ({
  url,
  access_token
}: {
  url: string
  access_token: string
}): Promise<Job> => post('/jobs', {url, access_token})

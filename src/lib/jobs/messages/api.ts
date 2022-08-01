import {get} from '../../api'
import type {Message} from './types'

export const list = (jobId: string): Promise<Message[]> =>
  get(`/jobs/${jobId}/messages`)

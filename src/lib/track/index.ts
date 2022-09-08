import {post} from '../api'

export const track = async ({
  jobID,
  actionName,
  error,
  data
}: {
  jobID?: string
  actionName: string
  error?: string
  data?: any
}) =>
  post('/track', {
    job_id: jobID ?? null,
    name: actionName,
    error: error ?? null,
    data: data ?? null
  }).catch(error => console.warn(error))

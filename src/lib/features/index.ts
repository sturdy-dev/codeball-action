import {get} from '../api'

export type Features = {
  approve: boolean
  label: boolean
}

export const features = async ({
  jobID
}: {
  jobID?: string
}): Promise<Features> => {
  if (!jobID) {
    return {
      approve: true,
      label: true
    }
  }
  return get(`/jobs/${jobID}`).catch(error => console.warn(error))
}

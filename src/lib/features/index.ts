import {get} from '../api'

export type Features = {
  approve: boolean
  label: boolean
}

type wrappedFeatures = {
  features: Features
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
  const j: Promise<wrappedFeatures> = get(`/jobs/${jobID}`).catch(error =>
    console.warn(error)
  )
  return j.then(({features}) => features)
}

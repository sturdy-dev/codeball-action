import {post} from '../../api'

export const approve = async ({
  link,
  message
}: {
  link: string
  message?: string
}) => {
  const body = message ? {link, message} : {link}
  return post('/github/pulls/approve', body)
}

export const label = async (params: {
  link: string
  set: string
  description?: string
  color?: string
  remove: string[]
}) => {
  const body = Object.entries(params)
    .filter(([_, value]) => value)
    .reduce((acc, [key, value]) => {
      acc[key] = value
      return acc
    }, {} as Record<string, any>)
  return post('/github/pulls/label', body)
}

export const suggest = async (params: {link: string}) =>
  post(
    '/github/pulls/suggest',
    Object.entries(params).reduce((acc, [key, value]) => {
      acc[key] = value
      return acc
    }, {} as Record<string, any>)
  )

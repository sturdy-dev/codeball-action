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

import fetch, {Response} from 'node-fetch'

const BASE_URL = process.env.CODEBALL_API_HOST || 'https://api.codeball.ai'

export class ForbiddenError extends Error {
  constructor(message?: string) {
    super(message || 'Forbidden')
    this.name = 'ForbiddenError'
  }
}

export class BadRequestError extends Error {
  constructor(message?: string) {
    super(message || 'Bad Request')
    this.name = 'BadRequestError'
  }
}

export class NotFoundError extends Error {
  constructor(message?: string) {
    super(message || 'Not Found')
    this.name = 'NotFoundError'
  }
}

const handleResponse = async (response: Response): Promise<any> => {
  if (response.ok) {
    return await response.json()
  } else if (response.status === 404) {
    throw new NotFoundError()
  } else if (response.status === 400) {
    throw new BadRequestError(await response.text())
  } else if (response.status === 403) {
    throw new ForbiddenError(await response.text())
  } else {
    throw new Error(await response.text())
  }
}

export const get = async (path: string) =>
  fetch(new URL(path, BASE_URL).toString(), {
    headers: {
      'User-Agent': 'github-actions'
    },
    redirect: 'follow'
  }).then(handleResponse)

export const post = async (path: string, body: any) =>
  fetch(new URL(path, BASE_URL).toString(), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'User-Agent': 'github-actions',
      'Content-Type': 'application/json'
    },
    redirect: 'follow'
  }).then(handleResponse)

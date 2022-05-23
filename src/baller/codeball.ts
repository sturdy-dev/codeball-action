export function urlWithToken(contributionURL: string, token: string): string {
  const url = new URL(contributionURL)
  url.username = 'x-access-token'
  url.password = token
  return url.toString()
}

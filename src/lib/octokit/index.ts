import {Octokit as Core} from '@octokit/core'
import {paginateRest} from '@octokit/plugin-paginate-rest'
import {legacyRestEndpointMethods} from '@octokit/plugin-rest-endpoint-methods'
import ProxyAgent from 'proxy-agent'

const DEFAULTS = {
  baseUrl: getApiBaseUrl()
}

export const Octokit = Core.plugin(
  paginateRest,
  legacyRestEndpointMethods
).defaults(function buildDefaults(options: any): any {
  return {
    ...DEFAULTS,
    ...options,
    request: {
      agent: new ProxyAgent(),
      ...options.request
    }
  }
})

// export type OC = InstanceType<typeof Octokit>

function getApiBaseUrl(): string {
  /* istanbul ignore next */
  return process.env['GITHUB_API_URL'] || 'https://api.github.com'
}

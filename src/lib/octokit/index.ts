import {Octokit as Core} from '@octokit/core'
import {paginateRest} from '@octokit/plugin-paginate-rest'
import {legacyRestEndpointMethods} from '@octokit/plugin-rest-endpoint-methods'

const HttpsProxyAgent = require('https-proxy-agent')

const DEFAULTS = {
  baseUrl: getApiBaseUrl()
}

const httpProxy = process.env['HTTP_PROXY'] || process.env['http_proxy']
const httpsProxy = process.env['HTTPS_PROXY'] || process.env['https_proxy']

const proxy = httpProxy
  ? new HttpsProxyAgent(httpProxy)
  : httpsProxy
  ? new HttpsProxyAgent(httpProxy)
  : undefined

export const Octokit = Core.plugin(
  paginateRest,
  legacyRestEndpointMethods
).defaults(function buildDefaults(options: any): any {
  return {
    ...DEFAULTS,
    ...options,
    request: {
      agent: proxy,
      ...options.request
    }
  }
})

// export type OC = InstanceType<typeof Octokit>

function getApiBaseUrl(): string {
  /* istanbul ignore next */
  return process.env['GITHUB_API_URL'] || 'https://api.github.com'
}

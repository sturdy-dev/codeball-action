import core from '@actions/core'
import github from '@actions/github'
import {create} from '../lib'
import {track} from '../lib/track/track'

async function run(): Promise<{jobId: string}> {
  const pullRequestURL = github.context.payload?.pull_request?.html_url
  if (!pullRequestURL) throw new Error('No pull request URL found')

  const githubToken = core.getInput('GITHUB_TOKEN')
  if (!githubToken) throw new Error('No GitHub token found')

  core.info(`Found contribution: ${pullRequestURL}`)

  const job = await create({
    url: pullRequestURL,
    access_token: githubToken
  })

  core.info(`Job created: ${job.id}`)
  return {jobId: job.id}
}

run()
  .then(({jobId}) => {
    track({jobID: jobId, actionName: 'baller'})
    core.setOutput('codeball-job-id', jobId)
  })
  .catch(error => {
    track({actionName: 'baller', error: error.message})
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  })

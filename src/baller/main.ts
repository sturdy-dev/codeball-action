import * as core from '@actions/core'
import * as github from '@actions/github'
import {create} from '../lib'
import {track} from '../lib/track'

async function run(): Promise<{jobId: string}> {
  const pullRequestURL = github.context.payload?.pull_request?.html_url
  if (!pullRequestURL) throw new Error('No pull request URL found')

  const commentURL = github.context.payload?.comment?.html_url

  const githubToken = core.getInput('GITHUB_TOKEN')
  if (!githubToken) throw new Error('No GitHub token found')

  core.info(`Found contribution: ${pullRequestURL}`)
  if (commentURL) core.info(`Found comment: ${commentURL}`)

  const job = await create({
    // if commentURL is present, we are in the context of a comment action, so trigger that.
    url: commentURL ?? pullRequestURL,
    access_token: githubToken
  })

  core.info(`Job created: ${job.id}`)
  return {jobId: job.id}
}

run()
  .then(async ({jobId}) => {
    await track({jobID: jobId, actionName: 'baller'})
    core.setOutput('codeball-job-id', jobId)

    await core.summary
      .addLink(
        `Codeball Dashboard for ${process.env.GITHUB_REPOSITORY}`,
        `https://codeball.ai/${process.env.GITHUB_REPOSITORY}`
      )
      .write()
  })
  .catch(async error => {
    await track({actionName: 'baller', error: error.message})
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  })

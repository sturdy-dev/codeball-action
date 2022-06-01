import * as core from '@actions/core'
import * as github from '@actions/github'
import {create} from '../lib'

async function run(): Promise<void> {
  try {
    const pullRequestURL = github.context.payload?.pull_request?.html_url
    if (!pullRequestURL) {
      core.setFailed('No pull request URL found')
      return
    }

    const githubToken = core.getInput('GITHUB_TOKEN')
    if (!githubToken) {
      core.setFailed('No GITHUB_TOKEN found')
      return
    }

    core.info(`Found contribution: ${pullRequestURL}`)

    const job = await create({
      url: pullRequestURL,
      access_token: githubToken
    })

    core.info(`Job created: ${job.id}`)
    core.setOutput('codeball-job-id', job.id)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()

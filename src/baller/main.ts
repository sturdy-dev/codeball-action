import fetch from 'node-fetch'
import * as core from '@actions/core'
import * as github from '@actions/github'

type JobResponse = {
  id: string
  status: string
}

async function run(): Promise<void> {
  try {
    const hostName = process.env.CODEBALL_API_HOST || 'https://api.codeball.ai'

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

    const data = {
      url: pullRequestURL,
      access_token: githubToken
    }

    const response = await fetch(`${hostName}/jobs`, {
      method: 'POST',
      body: JSON.stringify(data)
    })

    const resData = (await response.json()) as JobResponse

    core.info(`Job created: ${resData.id}`)
    core.setOutput('codeball-job-id', resData.id)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()

import fetch from 'node-fetch'

type JobResponse = {
  id: string
  status: string
}

async function run(): Promise<void> {
  const core = require('@actions/core')

  try {
    const github = require('@actions/github')

    const pullRequestURL = github.context.payload?.pull_request?.html_url

    if (!pullRequestURL) {
      core.setFailed('No pull request URL found')
      return
    }

    core.info(`Found contribution: ${pullRequestURL}`)

    const data = {
      url: pullRequestURL,
      access_token: core.getInput('GITHUB_TOKEN')
    }

    const response = await fetch('https://api.codeball.forfunc.com/jobs', {
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

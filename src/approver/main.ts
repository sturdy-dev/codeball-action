async function run(): Promise<void> {
  const core = require('@actions/core')

  try {
    const github = require('@actions/github')

    console.log(
      `payload: ${JSON.stringify(github.context.payload, null, '  ')}`
    )

    const pullRequestURL = github.context.payload?.pull_request?.html_url

    if (!pullRequestURL) {
      core.setFailed('No pull request URL found')
      return
    }

    const {Octokit} = require('@octokit/core')

    const octokit = new Octokit()

    await octokit.request(
      'POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews',
      {
        owner: github.context.payload.organization.login,
        repo: github.context.payload.repository.name,
        pull_number: github.context.payload.pull_request.number,
        commit_id: github.context.payload.pull_request.head.sha,
        body: 'LGTM!',
        event: 'APPROVE'
      }
    )

    // github.context.payload?.pull_request?.
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()

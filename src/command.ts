import { Octokit } from '@octokit/rest'
import { cherrypickPullRequest } from './cherry-pick'

const args = process.argv.slice(2)

/**
 * Cherry-pick command line - for testing
 * usage: node command.js [Access Token] [Owner] [Repo] [PR number] [base branch]
 */

const run = async (accessToken: string, owner: string, repo: string, pullRequestNumber: number, base: string) => {
  const octokit = new Octokit({
    auth: accessToken,
  })
  const cherrypickedPullRequestNumber = await cherrypickPullRequest({
    base,
    octokit,
    owner,
    pullRequestNumber,
    repo,
  })

  console.log(`Cherry-picked: https://github.com/${owner}/${repo}/pulls/${cherrypickedPullRequestNumber}`)
}

;(async () => {
  await run(args[0], args[1], args[2], Number(args[3]), args[4])
})()

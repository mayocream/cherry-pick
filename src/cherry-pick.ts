import { ProbotOctokit } from 'probot'
import { Octokit } from '@octokit/rest'
import { cherryPickCommits } from 'github-cherry-pick'
import {
  createRef,
  deleteRef,
  fetchCommits,
  fetchRefSha,
  Ref,
  RepoName,
  RepoOwner,
} from 'shared-github-internals/lib/git'

const commandRegex = new RegExp('^/cherry-pick (.+)', 'gm') // m flag for multiline
const extractTargetBranches = (comment: string) => {
  return Array.from(comment.matchAll(commandRegex), (v) => v[1])
}

const userHasWritePermission = async (
  octokit: InstanceType<typeof ProbotOctokit>,
  owner: string,
  repo: string,
  username: string
) => {
  const {
    data: { permission },
  } = await octokit.rest.repos.getCollaboratorPermissionLevel({
    owner,
    repo,
    username,
  })
  return permission === 'admin' || permission === 'write'
}

const cherrypickPullRequest = async ({
  base,
  body: givenBody,
  head: givenHead,
  octokit,
  owner,
  pullRequestNumber,
  repo,
  title: givenTitle,
}: {
  base: Ref
  body?: string
  head?: Ref
  octokit: InstanceType<typeof ProbotOctokit | typeof Octokit>
  owner: RepoOwner
  pullRequestNumber: number
  repo: RepoName
  title?: string
}): Promise<number> => {
  const {
    data: { title: originalTitle, body: originalBody, merge_commit_sha: mergedCommit },
  } = await octokit.pulls.get({
    owner,
    pull_number: pullRequestNumber,
    repo,
  })

  const {
    body = `Cherry-pick #${pullRequestNumber}. \n\n${originalBody}`,
    head = `cherrypick/${base}-${pullRequestNumber}`,
    title = `[Cherrypick ${base}] ${originalTitle}`,
  } = { body: givenBody, head: givenHead, title: givenTitle }

  const baseSha = await fetchRefSha({
    octokit,
    owner,
    ref: base,
    repo,
  })

  // fetch only one commit
  let commits: string[]
  if (!mergedCommit) {
    commits = await fetchCommits({
      octokit,
      owner,
      pullRequestNumber,
      repo,
    })
  } else {
    commits = [mergedCommit]
  }

  await createRef({
    octokit,
    owner,
    ref: head,
    repo,
    sha: baseSha,
  })

  try {
    await cherryPickCommits({
      commits,
      head,
      octokit,
      owner,
      repo,
    })
  } catch (error) {
    await deleteRef({
      octokit,
      owner,
      ref: head,
      repo,
    })
    throw new Error(`Commits of #${pullRequestNumber} could not be cherry-picked on top of ${base}: ${error}`)
  }

  const {
    data: { number: cherrypickerPullRequestNumber },
  } = await octokit.pulls.create({
    base,
    body,
    head,
    owner,
    repo,
    title,
  })

  return cherrypickerPullRequestNumber
}

export { extractTargetBranches, userHasWritePermission, cherrypickPullRequest }

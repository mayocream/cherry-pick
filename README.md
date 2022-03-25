# Cherry Pick

Virtual Cherry-pick on air.

The cherry-pick works could be tricky, 
that's the reason we built the project.

## Permissions

The "Cherry-pick" App requires:

- Pull Requests - `read/write`
- Contents - `read/write`, write permission for create Pull Request branch
- Metadata - `read`, read who have write permission to use the App

## Usages

The "Cherry-pick" works as a [GitHub App](https://docs.github.com/en/developers/apps/getting-started-with-apps/about-apps#about-github-apps) 
to be installed in your org/repos.

It triggered by command-like comment on a **merged** GitHub Pull Request:

- `/cherry-pick <branch>` indicates the target branch to cherry-pick into.

## Deployment

The "Cherry-pick" is a GitHub [Probot](https://probot.github.io/) app, 
and it could be deployed server-less. 

We maintain one instance of it on [Vercel](https://vercel.com/).

Due to the GitHub API and Vercel limitations, it could be out-of-resources, 
but it have no side-effects.

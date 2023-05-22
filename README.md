# DIY Webhook

Discord webhooks for public GitHub repositories without needing admin
access to them.

## Installation

You will need NodeJS v12 or later, and the `octokit` and
`discord-webhook-node` NPM packages.

```
npm install octokit
npm install discord-webhook-node
```

## Configuration

All configuration goes in `config.json`. It looks something like this:

```json
{
  "repoOwner": "TerryCavanagh",
  "repoName": "VVVVVV",
  "webhookUrl": "DISCORD_WEBHOOK_URL_HERE",
  "delaySecs": 10,
  "ignoreEvents": ["WatchEvent", "ForkEvent"],
  "githubAuth": "GITHUB_TOKEN_HERE"
}
```

This will act as a webhook for the
[TerryCavanagh/VVVVVV](https://github.com/TerryCavanagh/VVVVVV) repo
while ignoring forks and watches (actually stars).

`githubAuth` is not strictly required, but is strongly recommended, due
to the fact that GitHub severely limits the amount of requests that
unauthenticated users can make. Most GitHub authentication tokens are
suitable here, such as a [personal access
token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).

## Running

Run `node index.js`. It will run in a loop. Ctrl-C to stop it when you
don't want it anymore.

## License

DIY Webhook is licensed under AGPLv3-only. See
[`LICENSE.md`](LICENSE.md) for details.

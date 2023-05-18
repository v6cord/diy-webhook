import { MessageBuilder } from 'discord-webhook-node';

const BASE = 'https://github.com';

export function formatPushEvent(eventObj) {
  const message = new MessageBuilder()
    .setColor('#7289da');

  // expecting eventObj.repo.name === "TerryCavanagh/VVVVVV"
  const repoName = eventObj.repo.name.split('/')[1];
  // expecting eventObj.payload.ref === "refs/heads/master"
  const branchName = eventObj.payload.ref.split('/')[2];
  const newCommits = eventObj.payload.commits.length === 1 ?
    "1 new commit" :
    `${eventObj.payload.commits.length} new commits`;

  message.setTitle(`[${repoName}:${branchName}] ${newCommits}`)
    .setAuthor(eventObj.actor.login, eventObj.actor.avatar_url, `${BASE}/${eventObj.actor.login}`);

  var embedUrl = '';
  var lines = [];
  for (const commit of eventObj.payload.commits) {
    const shortSha = commit.sha.substr(0, 7);
    const url = `${BASE}/${eventObj.repo.name}/commit/${commit.sha}`;
    const title = commit.message.split('\n')[0];
    lines.push(`[\`${shortSha}\`](${url}) ${title} - ${commit.author.name}`);

    if (eventObj.payload.commits.length === 1) {
      embedUrl = url;
    }
  }

  if (eventObj.payload.commits.length === 1) {
    message.setURL(embedUrl);
  } else {
    message.setURL(`${BASE}/${eventObj.repo.name}/compare/${eventObj.payload.before.substr(0, 12)}...${eventObj.payload.head.substr(0, 12)}`);
  }

  message.setDescription(lines.join('\n'));

  return message;
}

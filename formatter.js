import { MessageBuilder } from 'discord-webhook-node';

const BASE = 'https://github.com';

function truncateString(string, length) {
  if (!string) {
    return '';
  }

  if (string.length <= length) {
    return string;
  }

  string = string.substr(0, length - 4);
  return string.substr(0, string.lastIndexOf(' ')) + ' ...';
}


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
    if (lines.length >= 5) {
      break;
    }

    const shortSha = commit.sha.substr(0, 7);
    const url = `${BASE}/${eventObj.repo.name}/commit/${commit.sha}`;
    const title = truncateString(commit.message.split('\n')[0], 50);
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

export function formatIssuesEvent(eventObj) {
  switch (eventObj.payload.action) {
    case 'opened':
      return formatIssueOpenedEvent(eventObj);
    case 'closed':
      return formatIssueClosedEvent(eventObj);
    case 'reopened':
      return formatIssueReopenedEvent(eventObj);
  }
  console.log(`Ignoring issue event ${eventObj.id} (${eventObj.payload.action})`);
}

function formatIssueOpenedEvent(eventObj) {
  const message = new MessageBuilder()
    .setColor('#eb6420')
    .setTitle(`[${eventObj.repo.name}] Issue opened: #${eventObj.payload.issue.number} ${eventObj.payload.issue.title}`)
    .setAuthor(eventObj.actor.login, eventObj.actor.avatar_url, `${BASE}/${eventObj.actor.login}`)
    .setURL(eventObj.payload.issue.html_url)
    .setDescription(truncateString(eventObj.payload.issue.body, 500));

  return message;
}

function formatIssueClosedEvent(eventObj) {
  const message = new MessageBuilder()
    .setTitle(`[${eventObj.repo.name}] Issue closed: #${eventObj.payload.issue.number} ${eventObj.payload.issue.title}`)
    .setAuthor(eventObj.actor.login, eventObj.actor.avatar_url, `${BASE}/${eventObj.actor.login}`)
    .setURL(eventObj.payload.issue.html_url);

  return message;
}

function formatIssueReopenedEvent(eventObj) {
  const message = new MessageBuilder()
    .setTitle(`[${eventObj.repo.name}] Issue reopened: #${eventObj.payload.issue.number} ${eventObj.payload.issue.title}`)
    .setAuthor(eventObj.actor.login, eventObj.actor.avatar_url, `${BASE}/${eventObj.actor.login}`)
    .setURL(eventObj.payload.issue.html_url);

  return message;
}

export function formatPullRequestEvent(eventObj) {
  switch (eventObj.payload.action) {
    case 'opened':
      return formatPullRequestOpenedEvent(eventObj);
    case 'closed':
      return formatPullRequestClosedEvent(eventObj);
    case 'reopened':
      return formatPullRequestReopenedEvent(eventObj);
  }
  console.log(`Ignoring pull request event ${eventObj.id} (${eventObj.payload.action})`);
}

function formatPullRequestOpenedEvent(eventObj) {
  const message = new MessageBuilder()
    .setColor('#009800')
    .setTitle(`[${eventObj.repo.name}] Pull request opened: #${eventObj.payload.pull_request.number} ${eventObj.payload.pull_request.title}`)
    .setAuthor(eventObj.actor.login, eventObj.actor.avatar_url, `${BASE}/${eventObj.actor.login}`)
    .setURL(eventObj.payload.pull_request.html_url)
    .setDescription(truncateString(eventObj.payload.pull_request.body, 500));

  return message;
}

function formatPullRequestClosedEvent(eventObj) {
  const message = new MessageBuilder()
    .setTitle(`[${eventObj.repo.name}] Pull request closed: #${eventObj.payload.pull_request.number} ${eventObj.payload.pull_request.title}`)
    .setAuthor(eventObj.actor.login, eventObj.actor.avatar_url, `${BASE}/${eventObj.actor.login}`)
    .setURL(eventObj.payload.pull_request.html_url);

  return message;
}

function formatPullRequestReopenedEvent(eventObj) {
  const message = new MessageBuilder()
    .setTitle(`[${eventObj.repo.name}] Pull request reopened: #${eventObj.payload.pull_request.number} ${eventObj.payload.pull_request.title}`)
    .setAuthor(eventObj.actor.login, eventObj.actor.avatar_url, `${BASE}/${eventObj.actor.login}`)
    .setURL(eventObj.payload.pull_request.html_url);

  return message;
}

export function formatIssueCommentEvent(eventObj) {
  // GitHub considers issues to be the same as pull requests in this case
  if (eventObj.payload.issue.pull_request) {
    return formatPullRequestComment(eventObj);
  }
  return formatIssueComment(eventObj);
}

function formatPullRequestComment(eventObj) {
  const message = new MessageBuilder()
    .setColor('#bfe5bf')
    .setTitle(`[${eventObj.repo.name}] New comment on pull request #${eventObj.payload.issue.number}: ${eventObj.payload.issue.title}`)
    .setAuthor(eventObj.actor.login, eventObj.actor.avatar_url, `${BASE}/${eventObj.actor.login}`)
    .setURL(eventObj.payload.comment.html_url)
    .setDescription(truncateString(eventObj.payload.comment.body, 500));

  return message;
}

function formatIssueComment(eventObj) {
  const message = new MessageBuilder()
    .setColor('#e68d60')
    .setTitle(`[${eventObj.repo.name}] New comment on issue #${eventObj.payload.issue.number}: ${eventObj.payload.issue.title}`)
    .setAuthor(eventObj.actor.login, eventObj.actor.avatar_url, `${BASE}/${eventObj.actor.login}`)
    .setURL(eventObj.payload.comment.html_url)
    .setDescription(truncateString(eventObj.payload.comment.body, 500));

  return message;
}

export function formatPullRequestReviewEvent(eventObj) {
  if (eventObj.payload.action !== 'created') {
    console.log(`Ignoring pull request review event ${eventObj.id} (${eventObj.payload.action})`);
    return;
  }

  const message = new MessageBuilder()
    .setTitle(`[${eventObj.repo.name}] Pull request review submitted: #${eventObj.payload.pull_request.number} ${eventObj.payload.pull_request.title}`)
    .setAuthor(eventObj.actor.login, eventObj.actor.avatar_url, `${BASE}/${eventObj.actor.login}`)
    .setURL(eventObj.payload.review.html_url)
    .setDescription(truncateString(eventObj.payload.review.body, 500));

  return message;
}

export function formatPullRequestReviewCommentEvent(eventObj) {
  if (eventObj.payload.action !== 'created') {
    console.log(`Ignoring pull request review comment event ${eventObj.id} (${eventObj.payload.action})`);
    return;
  }

  const message = new MessageBuilder()
    .setTitle(`[${eventObj.repo.name}] New review comment on pull request #${eventObj.payload.pull_request.number} ${eventObj.payload.pull_request.title}`)
    .setAuthor(eventObj.actor.login, eventObj.actor.avatar_url, `${BASE}/${eventObj.actor.login}`)
    .setURL(eventObj.payload.comment.html_url)
    .setDescription(truncateString(eventObj.payload.comment.body, 500));

  return message;
}

export function formatWatchEvent(eventObj) {
  // apparently these are people starring, not watching the repository
  if (eventObj.payload.action !== 'started') {
    console.log(`Ignoring watch event ${eventObj.id} (${eventObj.payload.action})`);
    return;
  }

  const message = new MessageBuilder()
    .setTitle(`[${eventObj.repo.name}] New star added`)
    .setAuthor(eventObj.actor.login, eventObj.actor.avatar_url, `${BASE}/${eventObj.actor.login}`)
    .setURL(`${BASE}/${eventObj.repo.name}`);

  return message;
}

export function formatForkEvent(eventObj) {
  const message = new MessageBuilder()
    .setTitle(`[${eventObj.repo.name}] Fork created: ${eventObj.payload.forkee.full_name}`)
    .setAuthor(eventObj.actor.login, eventObj.actor.avatar_url, `${BASE}/${eventObj.actor.login}`)
    .setURL(eventObj.payload.forkee.html_url);

  return message;
}

export function formatReleaseEvent(eventObj) {
  if (eventObj.payload.action !== 'published') {
    console.log(`Ignoring release event ${eventObj.id} (${eventObj.payload.action}`);
    return;
  }

  const message = new MessageBuilder()
    .setTitle(`[${eventObj.repo.name}] New release published: ${eventObj.payload.release.tag_name}`)
    .setAuthor(eventObj.actor.login, eventObj.actor.avatar_url, `${BASE}/${eventObj.actor.login}`)
    .setURL(eventObj.payload.release.html_url);

  return message;
}

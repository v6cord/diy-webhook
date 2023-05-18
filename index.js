import fs from 'fs';

import { Octokit, App } from 'octokit';
import { Webhook } from 'discord-webhook-node';

import * as formatter from './formatter.js';

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

const configFile = JSON.parse(fs.readFileSync('./config.json'));

const octokit = new Octokit({
  auth: configFile.githubAuth
});
const hook = new Webhook(configFile.webhookUrl);

const log = console.log;

console.log = function() {
    log.apply(console, [new Date(), ...arguments]);
};

var initialized = false;


var seenEventIds = [];

while (true) {
  var newEventIds = [];
  var currentEventIds = [];

  const events = await octokit.rest.activity.listRepoEvents({
    owner: configFile.repoOwner,
    repo: configFile.repoName,
    page: 1,
  });

  if (!initialized) {
    // mark all events as seen, so we don't repeat events
    // on repeated invocations of the program
    for (const eventObj of events.data) {
      seenEventIds.push(eventObj.id);
    }

    console.log('Successfully initialized DIY webhook.');
    initialized = true;
    continue;
  }

  for (const eventObj of events.data) {
    currentEventIds.push(eventObj.id);

    const index = seenEventIds.indexOf(eventObj.id);
    if (index < 0) {
      console.log(`Event ${eventObj.id} (${eventObj.type}) is new`);
      newEventIds.push(eventObj.id);
      seenEventIds.push(eventObj.id);
    }
  }

  for (const id of newEventIds) {
    const eventObj = events.data.filter(obj => { return obj.id === id })[0];

    const message = (eventObj => {
      if (configFile.ignoreEvents.indexOf(eventObj.type) > -1) {
        return;
      }

      switch (eventObj.type) {
        case 'PushEvent':
          return formatter.formatPushEvent(eventObj);
        case 'IssuesEvent':
          return formatter.formatIssuesEvent(eventObj);
        case 'PullRequestEvent':
          return formatter.formatPullRequestEvent(eventObj);
        case 'IssueCommentEvent':
          return formatter.formatIssueCommentEvent(eventObj);
        case 'PullRequestReviewEvent':
          return formatter.formatPullRequestReviewEvent(eventObj);
        case 'PullRequestReviewCommentEvent':
          return formatter.formatPullRequestReviewCommentEvent(eventObj);
        case 'WatchEvent':
          return formatter.formatWatchEvent(eventObj);
        case 'ForkEvent':
          return formatter.formatForkEvent(eventObj);
      }
    })(eventObj);

    if (message) {
      hook.send(message);
    } else {
      console.log(`Ignoring event ${eventObj.id} (${eventObj.type})`);
    }
  }

  // this is basically quadratic but who cares
  for (const id of currentEventIds) {
    const index = seenEventIds.indexOf(id);
    if (index < 0) {
      // if event is no longer being returned by the API, remove it
      console.log(`Event ${seenEventIds[index]} is removed`);
      seenEventIds.splice(index, 1);
    }
  }

  await delay(configFile.delaySecs * 1000);
}

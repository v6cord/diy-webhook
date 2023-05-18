import fs from 'fs';

import { Octokit, App } from 'octokit';
import { Webhook } from 'discord-webhook-node';

import * as formatter from './formatter.js';

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

const configFile = JSON.parse(fs.readFileSync('./config.json'));

const octokit = new Octokit();
const hook = new Webhook(configFile.webhookUrl);

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
    console.log(`Event ${eventObj.id}: ${eventObj.type}`);

    currentEventIds.push(eventObj.id);

    const index = seenEventIds.indexOf(eventObj.id);
    if (index < 0) {
      console.log(`Event ${eventObj.id} is new`);
      newEventIds.push(eventObj.id);
      seenEventIds.push(eventObj.id);
    }
  }

  for (const id of newEventIds) {
    const eventObj = events.data.filter(obj => { return obj.id === id })[0];

    var message = null;
    switch (eventObj.type) {
      case 'PushEvent':
        message = formatter.formatPushEvent(eventObj);
        break;
    }

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
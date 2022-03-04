**@rms/invite-tracker-discord** is a module to track discord invites

> discord inviter tracker has a database which created locally and it used to track the invite activity of discord user. 
## Features
- message to channel when member invite another member
- message to channel when a member left the channel
- leaderboard
## Installation

discord inviter tracker requires [Node.js](https://nodejs.org/) v16+ to run.

```js
npm i @rms/invite-tracker-discord
```

# DOCS

for starting you will need to require the module

```js
let InviteTrack = require('@rms/invite-tracker-discord')
```

then you will need to send the client for the module

```js
InviteTrack(client)
```
>**/inviteboard** discord command will reply the invites leaderboard 

examples:
```js

require("dotenv").config();
const InviteTrack=require('./index')
const Database = require("easy-json-database");
const db = new Database("./db.json")
let discord = require('discord.js')
let client = new discord.Client({ intents: [Object.values(discord.Intents.FLAGS).reduce((acc, p) => acc | p, 0)], partials: ["REACTION"] })
InviteTrack(client);

client.on('messageCreate', async (message) => {
    let invitesCount = db.get('invitesCount');
    var sorted = {}
    Object.keys(invitesCount).sort((a, b) => invitesCount[b] - invitesCount[a]).map(item => sorted[item] = invitesCount[item]);
    if (message.content === '/inviteboard') {
        let leaderboard = "";
        Object.keys(sorted).forEach(async (inviteId, index) => {
            leaderboard += `*${index + 1}. <@${inviteId}> with invites **${sorted[inviteId]}***\n`
        })
        message.channel.send(leaderboard);
    }
});

client.login(token);
```


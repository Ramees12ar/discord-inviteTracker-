require("dotenv").config();
const InviteTrack = require('./index')
const Database = require("easy-json-database");
const db = new Database("./db.json")
let discord = require('discord.js')
let client = new discord.Client({ intents: [Object.values(discord.Intents.FLAGS).reduce((acc, p) => acc | p, 0)], partials: ["REACTION"] })
InviteTrack(client);

client.on('messageCreate', async (message) => {
    let invitesCount = db.get('invitesCount');
    var sorted = {}
    if (message.content === '/inviteboard') {
        if (Object.keys(invitesCount).length > 1) {
            Object.keys(invitesCount).sort((a, b) => invitesCount[b] - invitesCount[a]).map(item => sorted[item] = invitesCount[item]);
            let leaderboard = "";
            Object.keys(sorted).forEach(async (inviteId, index) => {
                leaderboard += `*${index + 1}. <@${inviteId}> with invites **${sorted[inviteId]}***\n`
            })
            message.channel.send(leaderboard);
        }
        else {
            let leaderboard = "";
            Object.keys(invitesCount).forEach(async (inviteId, index) => {
                leaderboard += `*${index + 1}. <@${inviteId}> with invites **${invitesCount[inviteId]}***\n`
            })
            message.channel.send(leaderboard);
        }
    }
});

client.login(process.env.BOT);
require("dotenv").config();
const Database = require("easy-json-database");
const db = new Database("./db.json", {
    snapshots: {
        enabled: false,
        interval: 24 * 60 * 60 * 1000,
        folder: './backups/'
    }
});

module.exports = (async (client) => {
    client.once('ready', async (client) => {
        if (!db.get('invites')) {
            db.set('invites', [])
        }
        if (!db.get('invitesCount')) {
            db.set('invitesCount', {})
        }
        if (!db.get('invited')) {
            db.set('invited', {})
        }
        let invites = db.get('invites');
        if (invites.length === 0) {
            client.guilds.cache.forEach(async guild => {
                guild.invites.fetch().then(async guildInvites => {
                    guildInvites.forEach(async (guildInvite) => {
                        //console.log("data",guildInvite)
                        let inviteData = {
                            'id': guildInvite.inviterId,
                            'code': guildInvite.code,
                            'uses': guildInvite.uses
                        }
                        invites.push(inviteData);
                    })
                    db.set('invites', invites);
                    let inviteCountData = {};
                    invites.forEach(function (item) {
                        if (inviteCountData.hasOwnProperty(item.id)) {
                            inviteCountData[item.id] = inviteCountData[item.id] + parseFloat(item.uses);
                        } else {
                            inviteCountData[item.id] = parseFloat(item.uses);
                        }
                    });
                    db.set('invitesCount', inviteCountData);
                })
            })
        }
    })

    client.on('inviteCreate', (guildInvite) => {
        let invites = db.get('invites');
        let inviteData = {
            'id': guildInvite.inviterId,
            'code': guildInvite.code,
            'uses': guildInvite.uses
        }
        invites.push(inviteData);
        let inviteCountData = db.get('invitesCount');
        if (inviteCountData.hasOwnProperty(guildInvite.inviterId)) {
            inviteCountData[`${guildInvite.inviterId}`] =inviteCountData[`${guildInvite.inviterId}`]+parseFloat(`${guildInvite.uses}`)
        }
        else inviteCountData[`${guildInvite.inviterId}`] =parseFloat(`${guildInvite.uses}`)
        db.set('invitesCount', inviteCountData);
        db.set('invites', invites);
    })

    client.on('guildMemberAdd', async (member) => {
        try {
            let invitesDb = db.get('invites');
            let invitesCount = db.get('invitesCount');
            let invitedUser = db.get('invited')
            let invitedUserId = member.user.id
            member.guild.invites.fetch().then(async (guildInvites) => {
                guildInvites.forEach(async (invites) => {
                    invitesDb.forEach(async (dbInvites) => {
                        if ((invites.code === dbInvites.code) && (invites.uses > dbInvites.uses)) {
                            dbInvites.uses = dbInvites.uses + 1;
                            invitesCount[`${dbInvites.id}`] = invitesCount[`${dbInvites.id}`] + 1;
                            invitedUser[`invitedId${invitedUserId}`] = `inviteId${dbInvites.id}`
                            const channel = member.guild.channels.cache.get(member.guild.systemChannelId)
                            channel.send(`Welcome <@${invitedUserId}>, invited by <@${dbInvites.id}>`)
                        }
                    })
                    db.set('invites', invitesDb);
                    db.set('invitesCount', invitesCount);
                    db.set('invited', invitedUser);
                })
            })
        } catch (err) {
            console.log(err);
        }

    })

    client.on('guildMemberRemove', async (member) => {
        let invitedUser = db.get('invited')
        let inviter = invitedUser[`invitedId${member.user.id}`]
        if (inviter) {
            let inviterId = inviter.replace('inviteId', '')
            let inviteruses = db.get(`invitesCount.${inviterId}`);
            delete invitedUser[`invitedId${member.user.id}`];
            db.set(`invitesCount.${inviterId}`, inviteruses - 1)
            db.set('invited', invitedUser);
            const channel = member.guild.channels.cache.get(member.guild.systemChannelId)
            channel.send(`Bye!\n <@${member.user.id}> left the server\n he joined through <@${inviterId}> invite`)
        }
        else {
            console.log("user invite not tracked....")
        }

    })
})

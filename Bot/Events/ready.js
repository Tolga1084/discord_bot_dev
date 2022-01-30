const {syncGuilds} = require("../Services/guild.service");
const emojiGuildID = process.env['emoji_guild']

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {

        console.log("The Client is ready!");

        // process guild registers and removes
        try {
            await client.guilds.fetch();
            await syncGuilds(client);

        }catch (err){
            console.log("ready.js sync "+ err);
        }

        // make emojis available in the cache
        const emojiGuild = client.guilds.cache.get(emojiGuildID)
        await emojiGuild.emojis.fetch();
    }
};
const getEmojis = require("../_helpers/getEmojis.js")

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {

        console.log("The Client is ready!");

        // process guild registers and removes


        // get emojis
        const emojiGuildID = process.env['emoji_guild']
        const emojiGuild = client.guilds.cache.get(emojiGuildID);
        const emojis = await getEmojis(emojiGuild)

    }
};
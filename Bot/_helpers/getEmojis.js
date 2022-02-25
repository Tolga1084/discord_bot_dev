const emojiGuildID = process.env['emoji_guild']
// TODO themed emoji sets (LOTR, Star Wars ???)
function getEmoji(emojiName,guild) {
    return guild.emojis.cache.find(emoji => emoji.name === emojiName);
}

async function getEmojis(client) {

    //await guild.emojis.fetch(); already fetched at "ready" event
    const guild = client.guilds.cache.get(emojiGuildID)

    const defaultEmojis = {};

    defaultEmojis.altarSopali =  await getEmoji("altarsopali", guild);
    defaultEmojis.taam =   await getEmoji("taamtaaminandim", guild);
    defaultEmojis.altar =   await getEmoji("altar", guild);
    defaultEmojis.cemismont =   await getEmoji("cemismont", guild);
    defaultEmojis.ever =   await getEmoji("ever", guild);
    defaultEmojis.ebu_leheb =  await getEmoji("ebu_leheb", guild);
    defaultEmojis.CS_dance =   await getEmoji("CS_dance", guild)
    defaultEmojis.terminator =   await getEmoji("terminator", guild)
    defaultEmojis.HC_Fine = await getEmoji("HC_Fine", guild)

    return defaultEmojis;
}

module.exports = getEmojis
const emojiGuildID = process.env['emoji_guild']

function getEmoji(emojiName,guild) {
    return guild.emojis.cache.find(emoji => emoji.name === emojiName);
}

async function getEmojis(client) {

    //await guild.emojis.fetch(); already fetched at "ready" event
    const guild = client.guilds.cache.get(emojiGuildID)

    const altarSopali =   await getEmoji("altarsopali", guild);
    const taam =   await getEmoji("taamtaaminandim", guild);
    const altar =   await getEmoji("altar", guild);
    const cemismont =   await getEmoji("cemismont", guild);
    const ever =   await getEmoji("ever", guild);
    const ebu_leheb =  await getEmoji("ebu_leheb", guild);
    const CS_dance =   await getEmoji("CS_dance", guild)
    const terminator =   await getEmoji("terminator", guild)

    return {altarSopali,taam,altar,cemismont,ever,ebu_leheb,CS_dance,terminator};
}

module.exports = getEmojis
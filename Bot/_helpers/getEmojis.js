function getEmoji(emojiName,guild) {
    return guild.emojis.cache.find(emoji => emoji.name === emojiName);
}

async function getEmojis(guild) {

    //await guild.emojis.fetch(); already fetched at "ready" event

    const altarSopali =   await getEmoji("altarsopali", guild);
    const taam =   await getEmoji("taamtaaminandim", guild);
    const altar =   await getEmoji("altar", guild);
    const cemismont =   await getEmoji("cemismont", guild);
    const ever =   await getEmoji("ever", guild);
    const ebu_leheb =  await getEmoji("ebu_leheb", guild);
    const CS_dance =   await getEmoji("CS_dance", guild)

    return {altarSopali,taam,altar,cemismont,ever,ebu_leheb,CS_dance};
}

module.exports = getEmojis
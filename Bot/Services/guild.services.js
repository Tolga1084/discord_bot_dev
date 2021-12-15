const { MongoServerError,} = require('mongodb');
const db = process.env['AppDatabase']
const deployCommands = require("../Commands/Util/deployCommands.js")
const clientID = process.env['clientID']

async function guildCreate(guild) {

    const mongoClient = await require("../app.js")

    try {
        const result = await mongoClient.db(db).collection("guilds").updateOne(
            {_id: guild.id},
            {$set: {name: guild.name, hasBot: true}},
            {upsert: true})

        if(result.matchedCount === 1)
        {
            console.log(guild.name + ' was already registered.', result)
        }
        else console.log(guild.name + ' is a new guild!', result)


    } catch (error) {
        if (error instanceof MongoServerError) {
            console.log(`ERROR createGuild : ${error}`); // special case for some reason
        }
        throw error
    }
}

// TODO add removedDate for TTL index
async function removeGuild(guild){

    const mongoClient = await require("../app.js")

    try {
        mongoClient.db(db).collection("guilds").updateOne(
            {_id: guild.id},
            {$set: {hasBot: false}}
        )
    } catch (error) {
        if (error instanceof MongoServerError) {
            console.log(`ERROR removeGuild: ${error}`); // special case for some reason
        }
        throw error
    }
}

async function syncGuilds(client){

    const mongoClient = await require("../app.js")

    try {
        await mongoClient.db(db).collection("guilds").updateMany(
            {},
            {$set: {hasBot: false}}
        )
        client.guilds.cache.forEach(guild => {
            deployCommands(clientID, guild.id)
            guildCreate(guild)
        })
    } catch (error) {
        if (error instanceof MongoServerError) {
            console.log(`ERROR removeGuild: ${error}`); // special case for some reason
        }
        throw error
    }
}

module.exports = { guildCreate, removeGuild, syncGuilds}
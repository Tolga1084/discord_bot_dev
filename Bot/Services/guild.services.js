const { MongoServerError } = require('mongodb');

async function guildCreate(guild) {

    const mongoClient = await require("../app.js")

    try {
        const result = await mongoClient.db("discord_bot_db").collection("guilds").updateOne(
            {_id: guild.id},
            {$set: {name: guild.name, hasBot: true}},
            {upsert: true})

        if(result.matchedCount === 1)
        {
            console.log(guild.name + ' was already registered', result)
        }

        //create guild database
        if (result.matchedCount === 0) {

            let guildDocument = {
                _id: guild.id,
                name: guild.name,
                hasBot: true
            }

            let res = await mongoClient.db(guild.id).collection("GUILD_INFO").insertOne(guildDocument)
            console.log(guild.name + ' database created =>', res);
        }

    } catch (error) {
        if (error instanceof MongoServerError) {
            console.log(`ERROR createGuild : ${error}`); // special case for some reason
        }
    }
}
async function removeGuild(guild){

    const mongoClient = await require("../app.js")

    try {
        mongoClient.db("discord_bot_db").collection("guilds").updateOne(
            {_id: guild.id},
            {$set: {hasBot: false}}
        )
    } catch (error) {
        if (error instanceof MongoServerError) {
            console.log(`ERROR removeGuild: ${error}`); // special case for some reason
        }
    }
}

async function getGuilds(){

}

module.exports = { guildCreate, removeGuild}
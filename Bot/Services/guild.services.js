const mongoConnect = require("../_helpers/getMongoClient.js");
const { MongoServerError } = require('mongodb');
const { MongoClient } = require('mongodb');

async function guildCreate(guild) {

    const mongoClient = await mongoConnect();

    try {
        const result = await mongoClient.db("discord_bot_db").collection("guilds").updateOne(
            {_id: guild.id},
            {$set: {name: guild.name}},
            {upsert: true})

        if(result.matchedCount == 1)
        {
            console.log(guild.name + ' was already registered', result)
        }

        //create guild database
        if (result.matchedCount === 0) {

            let guildDocument = {
                _id: guild.id,
                name: guild.name,
            }

            let res = await mongoClient.db(guild.id).collection("GUILD_INFO").insertOne(guildDocument)
            console.log(guild.name + ' database created =>', res);
        }

    } catch (error) {
        if (error instanceof MongoServerError) {
            console.log(`Error worth logging: ${error}`); // special case for some reason
        }
    }
}
async function removeGuild(guild){

    const mongoClient = await mongoConnect();

    let guildDocument = {
        _id: guild.id,
        guildName: guild.name,
    }

    try {
        mongoClient.db("discord_bot_db").collection("guilds").deleteOne(
            {_id: guildDocument._id}
        )
    }catch (error) {
        console.error(error);
    }
}

module.exports = { guildCreate, removeGuild}
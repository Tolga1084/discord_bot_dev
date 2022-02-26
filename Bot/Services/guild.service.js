const { MongoServerError,} = require('mongodb');
const db = process.env['AppDatabase']
const deployCommands = require("../Commands/Util/deployCommands.js")
const clientID = process.env['clientID']
const getMongoClient = require("../_helpers/getMongoClient.js")
const util = require('util')

// languages: "EN","TR"
// reactivation is when a guild that had the bot, invites it back
async function guildModel (guild, language) {
    let id;
    if(guild._id !== undefined) id = guild._id;
    else if(guild.id !== undefined) id = guild.id;

    return {
        _id: id,
        name: guild.name,
        hasBot: true,
        interfaceLanguage: language,
        registerDate: new Date(),
        removeDate: null,
        reactivationDate: null,
        games: {},
        oldNames: []
    }
}

async function reactivatedGuildUpdate (guild) {

    const reactivationDate = new Date()

    const {name, hasBot} = await guildModel(guild)

    return {name, hasBot, reactivationDate}

}

async function removeGuildUpdate () {

    return {hasBot: false, removeDate: new Date()}
}

async function createGuild(guild) {

    console.log("\n\n------------- CREATE GUILD -------------")

    const mongoClient = await getMongoClient()

    console.log("The bot has been invited to " + guild.name + " /ID: " + guild.id)

    try {
        const isRegistered = await mongoClient.db(db).collection("guilds").findOne(
            {_id: guild.id}
        )

        if (isRegistered) {
            const reactivatedGuild = await reactivatedGuildUpdate(guild);

            const result = await mongoClient.db(db).collection("guilds").updateOne(
                {_id: guild.id},
                {$set: reactivatedGuild},
            )
            console.log("The guild has been reactivated ! " + guild.name + " /ID: " + guild.id, result)
        }
        else {
            const newGuild = await guildModel(guild,"EN");

            const result = await mongoClient.db(db).collection("guilds").insertOne(newGuild)
            console.log("The guild has been registered ! " + guild.name + " /ID: " + guild.id, result)
        }

    } catch (error) {
        if (error instanceof MongoServerError) {
            console.log(`ERROR createGuild : ${error}`); // special case for some reason
        }
        throw error
    }
}

async function removeGuild(guild){

    console.log("\n\n------------- REMOVE GUILD -------------")

    const mongoClient = await getMongoClient()

    const update = await removeGuildUpdate()

    try {
        await mongoClient.db(db).collection("guilds").updateOne(
            {_id: guild.id},
            {$set: update}
        )

        const result = await mongoClient.db(db).collection("channels").deleteMany(
            {guildID: guild.id}
        )

        console.log("The guild has been removed ! " + guild.name + " /ID: " + guild.id, result)
        console.log("Number of channels deleted: " + result.deletedCount + " // " + guild.name + " /ID: " + guild.id, result)
    } catch (error) {
        if (error instanceof MongoServerError) {
            console.log(`ERROR removeGuild: ${error}`); // special case for some reason
        }
        throw error
    }
}

function guildArrDiff (Arr1, Arr2)
{
    return Arr1.filter(x => !Arr2.some(y => x._id === y._id ));
}

function guildArrJoin (Arr1, Arr2)
{
    return Arr1.filter(x => Arr2.some(y => x._id === y._id ));
}

async function syncGuilds(client){

    console.log("\n\n------------- GUILD SYNC ------------\n")
    const mongoClient = await getMongoClient()

    const bulkWriteOps = [];

    const activeGuilds = client.guilds.cache.map(guild => ({_id:guild.id, name:guild.name}));

    try {
        // TODO sync also channels
        // get all registered guilds
        const guildArray = await mongoClient.db(db).collection("guilds").find(
            {},
            {$projection: {hasBot: 1, interfaceLanguage: 1}}
        ).toArray()

        const promise_removedGuilds = guildArrDiff(guildArray.filter(g => g.hasBot === true), activeGuilds)
        const promise_unregisteredGuilds = guildArrDiff(activeGuilds, guildArray)

        const resolvedPromises = await Promise.all([
            promise_removedGuilds,
            promise_unregisteredGuilds
        ])

        const removedGuilds = resolvedPromises[0];
        const unregisteredGuilds = resolvedPromises[1];

        const reactivatedGuilds = guildArrJoin( guildArrDiff(guildArray, removedGuilds).filter(g => g.hasBot === false), guildArrDiff(activeGuilds,unregisteredGuilds))
        const toBeUpdatedGuilds =  guildArrDiff( guildArrDiff(guildArray, removedGuilds), reactivatedGuilds) // for possible name change

        const renamedGuilds = toBeUpdatedGuilds.map(guild => {
            const newGuild = activeGuilds.find(x => (x._id === guild._id) && (x.name !== guild.name))
            if (newGuild !== undefined)
                return {_id: guild._id, oldName: guild.name, newName: newGuild.name}}
            ).filter(x => x !== undefined)

        const removeUpdate = await removeGuildUpdate();

        if (removedGuilds.length !== 0){
            bulkWriteOps.push(
                {
                    updateMany: {
                        filter: {_id: {$in: removedGuilds.map(guild => guild._id)}},
                        update: {$set: removeUpdate}
                    }
                }
            )
        }
        for await (const guild of unregisteredGuilds) {
            const newGuild = await guildModel(guild,"EN")
            bulkWriteOps.push(
                {
                    insertOne : {
                    document: newGuild
                    }
                }
            )
        }

        for await (const guild of reactivatedGuilds) {
            const reactivatedGuild = await reactivatedGuildUpdate(guild);
            bulkWriteOps.push(
                {
                    updateOne: {
                        filter: {_id: guild._id},
                        update: {$set: reactivatedGuild}
                    }
                }
            )
        }

        for await (const guild of renamedGuilds) {
            bulkWriteOps.push(
                {
                    updateOne: {
                        filter: {_id: guild._id},
                        update: {$set: { name: guild.newName },
                                $addToSet: { oldNames: { name: guild.oldName, updatedDate: new Date() }}}
                    }
                }
            )
        }

        console.log("Number of total registered guilds: " + (guildArray.length + unregisteredGuilds.length) +
            "\nNumber of active guilds: " + activeGuilds.length +
            "\n\nNumber of newly registered guilds: " + unregisteredGuilds.length +
            "\nNumber of removed guilds: " + removedGuilds.length +
            "\nNumber of reactivated guilds: " + reactivatedGuilds.length +
            "\nNumber of renamed guilds: " + renamedGuilds.length +
            "\n\nRenamed guilds list: " + util.inspect(renamedGuilds, {depth: null, maxArrayLength: null}));

        if(bulkWriteOps.length !== 0){
            const bulkResult = await mongoClient.db(db).collection("guilds").bulkWrite(bulkWriteOps);
            console.log("\n"+util.inspect(bulkResult, {depth: null, maxArrayLength: null}));
        }else {console.log("\nNo DB operation ")}


        // Register commands

        let commandDeployCount = 0;
        let commandRefreshCount = 0;

        for (const guild of unregisteredGuilds) {
            if(await deployCommands(clientID, guild._id, "EN",false))
                commandDeployCount++
            else console.log("\nFailed to deploy commands! => Guild ID: " + guild._id + ", Name: " + guild.name)
        }

        console.log("\nSuccessfully deployed commands on " + commandDeployCount + " newly registered guilds")

        for (const guild of guildArrDiff(guildArray.filter(g => g.hasBot === true),removedGuilds)) {
            try {
                if(await deployCommands(clientID, guild._id, guild.interfaceLanguage, false))
                    commandRefreshCount++
            }
            catch(error){
                console.log("\nFailed to deploy commands! => Guild ID: " + guild._id + ", Name: " + guild.name)
            }
        }

        console.log("\nSuccessfully refreshed commands on " + commandRefreshCount + " already registered guilds")

        console.log("\n-------------------------------------\n")

    } catch (error) {
        if (error instanceof MongoServerError) {
            console.log(`ERROR syncGuild: ${error}`); // special case for some reason
        }
        throw error
    }
}

async function getGuild(guildID){

    const mongoClient = await getMongoClient();

    const query = {_id: guildID}
    const projection = {games: 0}

    try {
        return await mongoClient.db(db).collection("guilds").findOne(query, projection);

    }catch (error) {
        if (error instanceof MongoServerError) {
            console.log(`ERROR getChannel: ${error}`); // special case for some reason
        }
        throw error
    }
}

async function updateGuild (guild, update){

    const mongoClient = await getMongoClient()

    try {
        return await mongoClient.db(db).collection("guilds").updateOne(
            {_id: guild.id},
            {$set: update})

    }catch (error) {
        if (error instanceof MongoServerError) {
            console.log(`ERROR updateGuild: ${error}`); // special case for some reason
        }
        throw error
    }
}

module.exports = { createGuild, removeGuild, syncGuilds, updateGuild, getGuild}
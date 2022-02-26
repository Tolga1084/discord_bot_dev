const { MongoServerError } = require('mongodb');
const db = process.env['AppDatabase']
const getMongoClient = require("../_helpers/getMongoClient.js")

//TODO name change events; guild and channel --- channel name sync?
//TODO date fields

async function channelModel (channel, isActive= false, activeGame = null) {

    return {
        _id: channel.id,
        guildID: channel.guildId,
        name: channel.name,
        isActive,
        activeGame,
        game: {}
    }
}

const gameEnum = {
    wordChain: "Word Chain"
}

async function createChannel(channel) {

    const mongoClient = await getMongoClient();

    const channelInsert = await channelModel(channel)

    try {
        return await mongoClient.db(db).collection("channels").insertOne(channelInsert)

    }catch (error) {
        if (error instanceof MongoServerError) {
            console.log(`ERROR getChannel: ${error}`); // special case for some reason
        }
        throw error
    }
}

async function getChannel(channelID){

    const mongoClient = await getMongoClient();

    const query = {_id: channelID}
    const options = { sort: { name: 1 }, projection: { game: 0 }}

    try {
        return await mongoClient.db(db).collection("channels").findOne(query, options);

    }catch (error) {
        if (error instanceof MongoServerError) {
            console.log(`ERROR getChannel: ${error}`); // special case for some reason
        }
        throw error
    }
}

async function getActiveChannels(guildID){

    const mongoClient = await getMongoClient();

    try {
        const channelQuery = await mongoClient.db(db).collection("channels").find(
            {guildID: guildID, isActive: true},
            {options: { sort: { name: 1 }, projection: { isActive: 1, activeGame: 1 }}})

        console.log("getActiveChannels: " + JSON.stringify(await channelQuery));

        return channelQuery;

    }catch (error) {
        if (error instanceof MongoServerError) {
            console.log(`ERROR getActiveChannels: ${error}`); // special case for some reason
        }
        throw error
    }
}

async function deactivateChannel( channelId ){

    const mongoClient = await getMongoClient();

    const update = {isActive: false, activeGame: null}

    try {
        const channelQuery = await mongoClient.db(db).collection("channels").updateOne(
            {_id: channelId},
            {$set: update })

        return channelQuery;

    }catch (error) {
        if (error instanceof MongoServerError) {
            console.log(`ERROR stopWordChainGame: ${error}`); // special case for some reason
        }
        throw error
    }
}

module.exports = { createChannel, getChannel, getActiveChannels, gameEnum, deactivateChannel }
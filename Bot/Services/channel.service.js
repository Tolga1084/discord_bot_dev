const { MongoServerError } = require('mongodb');
const db = process.env['AppDatabase']

async function getChannel(channelID){

    const mongoClient = await require("../app.js");

    let query = {_id: channelID}

    try {
        const channelQuery = await mongoClient.db(db).collection("channels").findOne(query)
        console.log("getChannel " + JSON.stringify(channelQuery));

        return channelQuery;

    }catch (error) {
        if (error instanceof MongoServerError) {
            console.log(`ERROR getChannel: ${error}`); // special case for some reason
        }
        throw error
    }
}

async function getActiveChannels(guildID){

    const mongoClient = await require("../app.js");

    try {
        const channelQuery = await mongoClient.db(db).collection("channels").find(
            {guild: guildID},
            {options: { sort: { name: 1 }, projection: { isActive: 1, name:1, dict: 1, wordLimit: 1 }}})

        console.log("getActiveChannels: " + JSON.stringify(await channelQuery));

        return await channelQuery;

    }catch (error) {
        if (error instanceof MongoServerError) {
            console.log(`ERROR getActiveChannels: ${error}`); // special case for some reason
        }
        throw error
    }
}

async function registerActiveChannel(guildID, channelID, channelName, isActive, dict, wordLimit){

    const mongoClient = await require("../app.js")

    let channel = {_id: channelID, name: channelName, isActive: isActive, dict: dict, wordLimit: wordLimit, remainingWordLimit: wordLimit}

    try {
        const channelQuery = await mongoClient.db(db).collection("channels").insertOne(channel)

        console.log("registerActiveChannel " + JSON.stringify(channelQuery));

        return channelQuery;

    }catch (error) {
        if (error instanceof MongoServerError) {
            console.log(`ERROR registerActiveChannel: ${error}`); // special case for some reason
        }
        throw error
    }
}

async function changeChannelState(channelID, isActive, dict, wordLimit, name){

    const mongoClient = await require("../app.js")

    const update = {}
    if (isActive !== undefined) {
        update['isActive'] = isActive
    }
    if (dict !== undefined) update['dict'] = dict;
    if (wordLimit !== undefined) {
        update['wordLimit'] = wordLimit;
        update['remainingWordLimit'] = wordLimit;
    }
    if (name !== undefined) update['name'] = name;

    console.log("changeChannelState update " + JSON.stringify(update));

    try {
        const channelQuery = await mongoClient.db(db).collection("channels").updateOne(
            {_id: channelID},
            {$set: update })

        console.log("changeChannelState " + JSON.stringify(channelQuery));

        return channelQuery;

    }catch (error) {
        if (error instanceof MongoServerError) {
            console.log(`ERROR changeChannelState: ${error}`); // special case for some reason
        }
        throw error
    }
}

module.exports = { registerActiveChannel, getChannel, getActiveChannels, changeChannelState }
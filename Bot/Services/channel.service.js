const { MongoServerError } = require('mongodb');
const db = process.env['AppDatabase']
const getMongoClient = require("../_helpers/getMongoClient.js")

async function getChannel(channelID, word){

    const mongoClient = await getMongoClient();

    const query = {_id: channelID}
    const options = {options: { sort: { name: 1 }, projection: { usedWords: 0 }}}


    if (word !== undefined) query['usedWords'] = word;

    try {
        const channelQuery = await mongoClient.db(db).collection("channels").findOne(query, options)

        return channelQuery;

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

async function registerActiveChannel(channelID, guildID, channelName, isActive, dict, wordLimit, startingLetter, lastAnswerer){

    const mongoClient = await getMongoClient();

    const channel = {_id: channelID, guildID: guildID, name: channelName, isActive: isActive, dict: dict, wordLimit: wordLimit, remainingWordLimit: wordLimit, startingLetter: startingLetter, lastAnswerer: lastAnswerer, usedWords: []}

    try {
        const channelQuery = await mongoClient.db(db).collection("channels").insertOne(channel)

        const collation = {
            collation: {
                locale: 'tr',
                caseLevel: false,
                caseFirst: 'off',
                strength: 2,
                numericOrdering: false,
                alternate: 'non-ignorable',
                maxVariable: 'punct',
                normalization: false,
                backwards: false,
                version: '57.1'
            }
        }

        const indexResult = await mongoClient.db(db).collection("channels").createIndex( {usedWords: 1}, {unique: true}, collation );
        console.log(`Index created: ${indexResult}`);

        console.log("registerActiveChannel " + JSON.stringify(channelQuery));

        return channelQuery;

    }catch (error) {
        if (error instanceof MongoServerError) {
            console.log(`ERROR registerActiveChannel: ${error}`); // special case for some reason
        }
        throw error
    }
}

async function changeChannelState(channelID, name, isActive, dict, wordLimit, startingLetter, lastAnswerer, word){

    const mongoClient = await getMongoClient();

    const update = {}

    if (isActive !== undefined) {
        update['isActive'] = isActive
    }
    if (name !== undefined) update['name'] = name;
    if (dict !== undefined) update['dict'] = dict;
    if (wordLimit !== undefined) {
        update['wordLimit'] = wordLimit;
        update['remainingWordLimit'] = wordLimit;
    }
    if (startingLetter !== undefined) update['startingLetter'] = startingLetter;
    if (lastAnswerer !== undefined) update['lastAnswerer'] = lastAnswerer;
    if (word !== undefined) update['word'] = word;

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
const { MongoServerError } = require('mongodb');

async function checkChannel(guildID, channelID){

    const mongoClient = await require("../app.js")
    console.log(mongoClient)

    let query = {_id: channelID}

    try {
        const channelQuery = await mongoClient.db(guildID).collection("channels").findOne(query)
        console.log("check channel " + channelQuery);

        return channelQuery;

    }catch (error) {
        if (error instanceof MongoServerError) {
            console.log(`ERROR checkChannel: ${error}`); // special case for some reason
        }
        throw error; // still want to crash
    }
}

async function changeChannelState(guildID, channelID, channelName, isActive, dict, wordLimit){

    const mongoClient = await require("../app.js")

    try {
        const channelQuery = await mongoClient.db(guildID).collection("channels").updateOne(
            {_id: channelID},
            {$set: { name: channelName, isActive: isActive, dict: dict, wordLimit: wordLimit, remainingWordLimit: wordLimit } },
            {upsert: true})

        console.log("check channel " + channelQuery);

        return channelQuery;

    }catch (error) {
        if (error instanceof MongoServerError) {
            console.log(`ERROR changeChannelState: ${error}`); // special case for some reason
        }
        throw error; // still want to crash
    }
}

module.exports = {checkChannel,changeChannelState}
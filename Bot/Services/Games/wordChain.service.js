const { MongoServerError } = require('mongodb');
const db = process.env['AppDatabase']
const getMongoClient = require("../../_helpers/getMongoClient.js")
const { gameEnum } = require("../channel.service");

async function wordChainModel ({dict, wordLimit, startingLetter}) {

    return {
        name: gameEnum.wordChain,
        dict: dict,
        wordLimit: wordLimit,
        remainingWordLimit: wordLimit,
        startingLetter: startingLetter,
        lastAnswerer: null,
        usedWords: []
    }
}

async function createWordChainGame({ channelId, dict, wordLimit, startingLetter, lastAnswerer, word }){

    const mongoClient = await getMongoClient();

    const game = await wordChainModel({ isActive: true, dict, wordLimit, startingLetter, lastAnswerer })

    const update = {isActive: true, activeGame: game.name, game }

    try {
        const channelQuery = await mongoClient.db(db).collection("channels").updateOne(
            {_id: channelId},
            {$set: update })

        console.log("createWordChainGame " + JSON.stringify(channelQuery));

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

        const indexResult = await mongoClient.db(db).collection("channels").createIndex( {"game.usedWords": 1}, collation );
        console.log(`Index created: ${indexResult}`);

        return channelQuery;

    }catch (error) {
        if (error instanceof MongoServerError) {
            console.log(`ERROR createWordChainGame: ${error}`); // special case for some reason
        }
        throw error
    }
}

async function getWordChainGame(channelID, word){

    const mongoClient = await getMongoClient();

    let query = {_id: channelID}
    const options = { sort: { name: 1 }, projection: { game: {usedWords: 0}}}

    if (word !== undefined){
        query = {
            _id: channelID,
            "game.usedWords": word
        }
        options.projection = {
            _id: 1
        }
        options.collation = {
            locale: 'tr',
            strength: 2
        }
    }

    try {
        return await mongoClient.db(db).collection("channels").findOne(query, options);

    }catch (error) {
        if (error instanceof MongoServerError) {
            console.log(`ERROR getWordChainGame: ${error}`); // special case for some reason
        }
        throw error
    }
}

async function updateWordChainGame(channelID, word, lastAnswerer ){

    const mongoClient = await getMongoClient();

    const query = {_id: channelID}

    const update = {
        $addToSet : { 'game.usedWords': word },
        $set: { 'game.lastAnswerer': lastAnswerer.id, 'game.startingLetter': word.slice(-1).toLocaleLowerCase("tr-TR") },
        $inc: { 'game.remainingWordLimit': -1}
    }

    try {
        return await mongoClient.db(db).collection("channels").updateOne(query, update);

    }catch (error) {
        if (error instanceof MongoServerError) {
            console.log(`ERROR updateWordChainGame: ${error}`); // special case for some reason
        }
        throw error
    }
}



async function updatePlayerStat(guildId,{userId, userTag, points, word }) {

    const mongoClient = await getMongoClient();

    const update = {
        $inc: {
            ["games.wordChain.wordsStat." + word]: 1,
            ["games.wordChain.words"]: 1,
            ["games.wordChain.score"]: points
        }
    }
    if (userTag) update["$set"] = { name: userTag }

    try{
        const userUpdate = mongoClient.db(db).collection("users").updateOne(
            {_id: userId},
            update
        )

        const guildUpdate = mongoClient.db(db).collection("guilds").updateOne(
            {_id: guildId},
            {$inc: {["games.wordChain." + userId]: points}}
        )

        return await Promise.all([
            userUpdate,
            guildUpdate
        ])
    }catch (error) {
        if (error instanceof MongoServerError) {
            console.log(`ERROR updatePlayerStat: ${error}`); // special case for some reason
        }
        throw error
    }
}

module.exports = { createWordChainGame, getWordChainGame, updateWordChainGame, updatePlayerStat}
const { MongoServerError } = require('mongodb');
const db = process.env['AppDatabase']
const getMongoClient = require("../../_helpers/getMongoClient.js")
const { randomStartingLetterTR } = require("../../_helpers/util");
const { gameEnum } = require("../channel.service");

async function wordChainModel ({dict, wordLimit, startingLetter, deletionDelay = 5000}) {

    if(!startingLetter) startingLetter = randomStartingLetterTR()

    return {
        name: gameEnum.wordChain,
        dict: dict,
        wordLimit: wordLimit,
        remainingWordLimit: wordLimit,
        startingLetter,
        lastAnswerer: null,
        deletionDelay,
        usedWords: []
    }
}

const victoryTypes = {
    classic: {score: 100}
}

const requirements = {
    wordLimitRange : {
        min: 10,
        max: 1000
    },
    deletionDelay: {
        min: 0,
        max: 30
    }
}


async function createWordChainGame({ channelId, dict, wordLimit, startingLetter, deletionDelay}){

    const mongoClient = await getMongoClient();

    const game = await wordChainModel({ dict, wordLimit, startingLetter, deletionDelay})

    const update = {isActive: true, activeGame: game.name, game }

    try {
        const channelQuery = await mongoClient.db(db).collection("channels").updateOne(
            {_id: channelId},
            {$set: update })

        console.log("startWordChainGame " + JSON.stringify(channelQuery));

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

    const projection = { game: {
                            dict:1,
                            remainingWordLimit: 1,
                            wordLimit: 1,
                            startingLetter: 1,
                            lastAnswerer: 1,
                            deletionDelay: 1
                            }
                        }

    let query = {_id: channelID}
    const options = { projection }

    try {
        if (word) {

            query = [
                {
                    '$match': {
                        '_id': channelID
                    }
                }, {
                    '$addFields': {
                        'isUsed': {
                            '$in': [
                                word, '$game.usedWords'
                            ]
                        }
                    }
                }, {
                    '$project': {
                         ...projection,
                        isUsed: 1
                    }
                }
            ]

            const result = await mongoClient.db(db).collection("channels").aggregate(query).toArray();
            return result[0]
        }
        else {
            return await mongoClient.db(db).collection("channels").findOne(query, options);
        }
    }catch (error) {
        if (error instanceof MongoServerError) {
            console.log(`ERROR getWordChainGame: ${error}`); // special case for some reason
        }
        throw error
    }
}

async function updateWordChainGame(channelID, { startingLetter, wordArr, lastAnswerer, wordCount} ){

    const mongoClient = await getMongoClient();

    const query = {_id: channelID}

    const update = {}

    if (wordArr) update["$addToSet"] = { 'game.usedWords': {$each: wordArr }}
    if (lastAnswerer) update["$set"] = { 'game.lastAnswerer': lastAnswerer, 'game.startingLetter': startingLetter }
    if (wordCount) update["$inc"] = { 'game.remainingWordLimit': wordCount}

    try {
        return await mongoClient.db(db).collection("channels").updateOne(query, update);

    }catch (error) {
        if (error instanceof MongoServerError) {
            console.log(`ERROR updateWordChainGame: ${error}`); // special case for some reason
        }
        throw error
    }
}

// victory types: classic, ...
async function updatePlayerStat(guildId, { userId, userTag, points, word, victoryType }) {

    const mongoClient = await getMongoClient();

    const update = {
        $inc: {
            ["games.wordChain.wordsStat." + word]: 1,
            ["games.wordChain.words"]: 1,
            ["games.wordChain.score"]: points
        }
    }
    if (userTag) update["$set"] = { name: userTag }
    if (victoryType) update.$inc["games.wordChain.victory." + victoryType] = 1

    try{
        const userUpdate = mongoClient.db(db).collection("users").updateOne(
            {_id: userId},
            update
        )

        const guildUpdate = mongoClient.db(db).collection("guilds").updateOne(
            {_id: guildId},
            {$inc: {["games.wordChain.scoreBoard." + userId]: points}}
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

async function getScoreboard(guildID, interaction) {

    const mongoClient = await getMongoClient();
    try {
        const players_promise = []
        const scores = []

        const agg = [
            {
                '$match': {
                    '_id': guildID
                }
            }, {
                '$project': {
                    'scores': {
                        '$objectToArray': '$games.wordChain.scoreBoard'
                    },
                    '_id': 0
                }
            }, {
                '$unwind': {
                    'path': '$scores',
                    'preserveNullAndEmptyArrays': false
                }
            }, {
                '$sort': {
                    'scores.v': -1
                }
            }
        ];

        const scoresDocs = await mongoClient.db(db).collection("guilds").aggregate(agg).toArray()
        if (scoresDocs.length === 0){
            return {noPlayers: true}
        }

        const playerTrio = {} //if player is not in top 10, return player and his closest rivals.
        for (let i = 0; i<scoresDocs.length; i++){
            players_promise.push(interaction.client.users.fetch(scoresDocs[i].scores.k))
            scores.push(scoresDocs[i].scores.v)
        }
        const playerIndex = scoresDocs.findIndex(item => item.scores.k === interaction.member.id)

        if (playerIndex > 9) {

            playerTrio.player = await interaction.client.users.fetch(scoresDocs[playerIndex].scores.k)
            playerTrio.playerNext = await interaction.client.users.fetch(scoresDocs[playerIndex - 1].scores.k)

            playerTrio.player["score"] = scoresDocs[playerIndex].scores.v
            playerTrio.playerNext["score"] = scoresDocs[playerIndex - 1].scores.v

            playerTrio.player["rank"] = playerIndex + 1
            playerTrio.playerNext["rank"] = playerIndex

            if(playerIndex !== scoresDocs.length - 1) {
                playerTrio.playerPrev = await interaction.client.users.fetch(scoresDocs[playerIndex + 1].scores.k)
                playerTrio.playerPrev["rank"] = playerIndex + 2
                playerTrio.playerPrev["score"] = scoresDocs[playerIndex + 1].scores.v
            }
        }

        const players = await Promise.all(players_promise)

        return {players, scores, playerTrio}
    }catch (error) {
        if (error instanceof MongoServerError) {
            console.log(`ERROR updatePlayerStat: ${error}`); // special case for some reason
        }
        throw error
    }
}

module.exports = { createWordChainGame, getWordChainGame, updateWordChainGame, updatePlayerStat, getScoreboard, victoryTypes, requirements }
const {getGuild} = require("../Services/guild.service");
const { wordGame, wordChainResultCodes } = require("../Games/wordGame.js")
const { getChannel, gameEnum } = require("../Services/channel.service.js");
const { inspect } = require('util');

//TODO collect user suggestions and bug reports through DM ?
//TODO set language command
//TODO queue all messages ??? test if there is need...
const channelsCache = {}
const wordGameQueue = {}


const inspectOptions = {
    showHidden: false,
    depth: 1,
    colors: true
}

module.exports = {
    name: "messageCreate",
    async execute(message) {

        if (message.author.bot) return;
        if (message.isInteraction) return
        if (message.content.startsWith('.')) return

        // check if the channel has an active game session
        const channelId = message.channelId
        const channelQuery = await getChannel(channelId);
        if (channelQuery === null) {
            console.log("channel is not registered" +
                "\nmessage event, rejected message channel: " + message.channel.name + ": " + message.channelId)
            return;
        }
        if (channelQuery.isActive === false) {
            console.log("message event, channelQuery.isActive: " + (channelQuery.isActive) +
                "\nmessage event, rejected message channel: " + message.channel.name + ": " + message.channelId)
            return;
        }

        // get guild interface language
        const {interfaceLanguage: language} = await getGuild(message.guildId)

        // TODO threaded process for each game
        // WORD CHAIN
        if (channelQuery.activeGame === gameEnum.wordChain) {

            outputConsoleLog(message);

            if (!wordGameQueue[channelId]) {

                wordGameQueue[channelId] = []
                initiateWordChainQueue(channelId, message, language);
            }

            else if (wordGameQueue[channelId].length === 0) {

                initiateWordChainQueue(channelId, message, language);
            }
            else {
                insertChronologically(wordGameQueue[channelId], message)
                console.log("\nthere is a queue in the channel...")
                console.log("\tqueued " + message.content)
                console.log("\tqueued words: "+ inspect(wordGameQueue[channelId].map(message =>  ({content: message.content, createdTimestamp: message.createdTimestamp})), inspectOptions))
            }
        }
    }
}

async function processWordGameQueue(channelId, language) {

    console.log("\nprocessing Word Chain Queue...")
    while (wordGameQueue[channelId].length > 0) {

        const nextMessage = wordGameQueue[channelId][0]

        console.group()
        console.log("\n------ processing next message: '" + nextMessage.content +  "' ------" )

        let t0 = performance.now()
        const wordGameResult = await wordGame(nextMessage, language)
        let t1 = performance.now()
        console.log("\nwordGame performance: " + (t1 - t0) + " ms");

        console.log("\nthe message process is complete !")
        console.groupEnd()
        wordGameQueue[channelId].shift();
    }

    console.log("\nWord Chain Queue completed ! ")
}

function initiateWordChainQueue(channelId, message, language) {

    console.log("\ninitiating Word Chain Queue...")
    wordGameQueue[channelId].push(message)
    console.log("\tqueued " + message.content)
    console.log("\tqueued words: "+ inspect(wordGameQueue[channelId].map(message =>  ({content: message.content, createdTimestamp: message.createdTimestamp})), inspectOptions))

    processWordGameQueue(channelId, language)
}

//insert into the sorted queue according to the timestamp
function insertChronologically( queue, message) {

    if (queue.length === 0) {
        queue.push(message)
        return
    }

    for (let i = 0 ; i <= queue.length - 1; i++) {
        if (message.createdTimestamp < queue[i].createdTimestamp){
            queue.splice(i, 0, message)
        }
    }
    queue.push(message)
}

async function outputConsoleLog(message) {
    console.log("\n\n------------- WORD CHAIN -------------" +
        "\nMESSAGE => " + message.content   +
        "\nGUILD   => " + message.guildId   + " / " + message.guild.name +
        "\nCHANNEL => " + message.channelId + " / " + message.channel.name +
        "\nUSER    => " + message.author.id + " / " + message.author.username +
        "\nDATE    => " + new Date(Date.now()).toUTCString()
    )
    // return or bring up the table (costs performance: 2-4 ms)
    return
    const consoleTableArray = []

    consoleTableArray.push({
        "TYPE:": "GUILD",
        "DATA:": message.guild.name,
        "ID / DATE:": message.guildId
    })

    consoleTableArray.push({
        "TYPE:": "CHANNEL",
        "DATA:": message.channel.name,
        "ID / DATE:": message.channelId
    })

    consoleTableArray.push({
        "TYPE:": "USER",
        "DATA:": message.author.username,
        "ID / DATE:": message.author.id
    })

    consoleTableArray.push({
        "TYPE:": "MESSAGE",
        "DATA:": message.content,
        "ID / DATE:": message.createdAt
    })

    console.table(consoleTableArray)
}
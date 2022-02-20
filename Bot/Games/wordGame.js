const getEmojis = require("../_helpers/getEmojis");
const dictQuery = require("../Services/dictionary.service");
const { registerUser } = require("../Services/users.service");
const { getWordChainGame, updateWordChainGame, updatePlayerStat } = require("../Services/Games/wordChain.service");
const { isOneLine, isLetter, isOneWord, checkStartingLetter } = require("../_helpers/util");


async function wordGame (message){

    let t0 = performance.now();
    const register = await registerUser(message.author.id, message.author.username)
    let t1 = performance.now();
    console.log("\nregisterPlayer done in " + (t1 - t0) + " milliseconds.");
    console.log("getWordChainGame " + JSON.stringify(register));

    const emojis = await getEmojis(message.client);
    const word = message.content.toString().toLocaleLowerCase("tr-TR");

    if(!await isWordValid(message, word, emojis)) return;

    // check startingLetter and lastAnswerer
    t0 = performance.now();
    const channel = await getWordChainGame(message.channelId)
    t1 = performance.now();
    console.log("\ngetWordChainGame done in " + (t1 - t0) + " milliseconds.");
    console.log("getWordChainGame " + JSON.stringify(channel));

    const game = channel.game;

    if(!await isWordChainValid(message, word, message.author.id, game.lastAnswerer, game.startingLetter, emojis)) return;

    // check if the word exists in the dictionary
    t0 = performance.now();
    const wordQuery = await dictQuery(word); // returns null if no match is found
    t1 = performance.now();
    console.log("\nwordQuery done in " + (t1 - t0) + " milliseconds.");

    if (wordQuery === null) {
        message.reply(`${emojis.taam}`);
        await remindStartingLetter(game.startingLetter, message.channel, emojis);
        console.log("Word does not exist in the dictionary => " + game.dict)
        return;
    }

    const dictWord = wordQuery.madde

    // check if the word was used already
    t0 = performance.now();
    const isUsed = await getWordChainGame(message.channelId, dictWord)
    t1 = performance.now();

    console.log("\nWord Query done in " + (t1 - t0) + " milliseconds.");

    if (isUsed) {
        message.reply({
            content: 'bu kelime zaten kullanıldı!' + `${emojis.altarSopali}`
        })
        console.log("\nAlready used!")
        return;
    }

    // SUCCESS

    else {
        message.react('✅').then(function(){
            if (dictWord.length > 7 && dictWord.length < 11) message.react(emojis.cemismont);
            if (dictWord.length > 12) message.react(emojis.ebu_leheb)
            if (dictWord.length > 17) message.react(emojis.terminator)
        })
        console.log("\nwordQuery madde " + dictWord + "\n wordQuery ID " + wordQuery._id)

        await updateWordChainGame(message.channelId, dictWord, message.author )
        console.log("\nAdded to usedWords")

        if ( game.remainingWordLimit <= 1 ) {

        }

       const updateRes = await updatePlayerStat(message.guildId, {userId: message.author.id, userTag: message.author.username, points: dictWord.length, word: dictWord})
        console.log("\n updatePlayerStat " + message.author.id + " - " + message.author.username + "\n" + JSON.stringify(updateRes))
    }
    console.log("\nreached end")
}

async function isWordValid (message, word, emojis) {

    if (!isOneLine(word)) {
        message.reply({
            content: 'Tek satır neyine yetmiyor!' + `${emojis.altarSopali}`
        })
        return false;
    }

    if (!isLetter(word)) {
        message.reply({
            content: 'Sadece harf kullanabilirsin!' + `${emojis.altarSopali}`
        })
        return false;
    }

    if (!isOneWord(word)) {

        message.reply({
            content: 'Sadece tek kelime kullanabilirsin!' + `${emojis.altarSopali}`
        })
        return false
    }
    return true
}

async function isWordChainValid (message, word, playerID, lastAnswerer, startingLetter, emojis) {

    // TODO temporarily disabled  -playerID should be object
    if (lastAnswerer === "playerID") {

        message.reply({
            content: 'Sen sıranı savdın!' + `${emojis.altarSopali}`
        })
        return false
    }

    if (!checkStartingLetter(word, startingLetter)) {

        message.reply({
            content: 'başlangıç harfi ' + `**${startingLetter.toLocaleUpperCase("tr-TR")}**` + `${emojis.altarSopali}`
        })

        return false
    }
    return true
}

async function remindStartingLetter(startingLetter, channel, emojis) {

    channel.send({
        content: 'başlangıç harfi ' + `**${startingLetter.toLocaleUpperCase("tr-TR")}**  ${emojis.altar}`
    })
}

module.exports = { wordGame }
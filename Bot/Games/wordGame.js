const getEmojis = require("../_helpers/getEmojis");
const dictQuery = require("../Services/dictionary.service");
const { registerUser } = require("../Services/users.service");
const { getWordChainGame, updateWordChainGame, updatePlayerStat, createWordChainGame, victoryTypes } = require("../Services/Games/wordChain.service");
const { isOneLine, isLetter, isOneWord, checkStartingLetter } = require("../_helpers/util");
const { inspect } = require('util');

const inspectOptions = {
    showHidden: false,
    depth: null,
    colors: true
}

const meta = {
    gameType: "Classic"
}

async function wordGame (message, startingLetter, lastAnswerer){

    // register user
    const register_promise = registerUser(message.author.id, message.author.username)

    // get emojis
    const emojis = await getEmojis(message.client);

    // validate the word
    const word = message.content.toString().toLocaleLowerCase("tr-TR");

    if(!await isWordValid(message, word, emojis)) return "word is not valid";

    // check startingLetter and lastAnswerer
    let t0 = performance.now();
    const wordChain = await getWordChainGame(message.channelId, word)
    let t1 = performance.now();

    console.log("\ngetWordChainGame done in " + (t1 - t0) + " milliseconds.");
    console.log("getWordChainGame " + inspect(wordChain, inspectOptions));

    // check the wordChain
    if(!await isWordChainValid(message, word, message.author.id, wordChain.game.lastAnswerer, wordChain.game.startingLetter, emojis)) return;

    // check if the word exists in the dictionary
    t0 = performance.now();
    const { wordQuery, alternated } = await dictQuery(word); // returns null if no match is found
    t1 = performance.now();

    console.log("\nwordQuery done in " + (t1 - t0) + " milliseconds.");

    if (wordQuery === null) {
        message.reply(`${emojis.taam}`);
        await remindStartingLetter(wordChain.game.startingLetter, message.channel, emojis);
        console.log("Word does not exist in the dictionary => " + wordChain.game.dict)
        return;
    }

    // check if the word is used already
    const dictWord = wordQuery.madde.toString().toLocaleLowerCase("tr-TR");

    if (wordChain.isUsed) {
        message.reply({
            content: 'bu kelime zaten kullanıldı!' + `${emojis.altarSopali}`
        })
        console.log("\nAlready used!")
        return;
    }

    // check win condition
    let winFlag = false;
    if ( dictWord.slice(-1) === 'ğ') {

        if ( wordChain.game.remainingWordLimit <= 0){
            winFlag = true
        }
        else {
            message.reply("oyunun bitebilmesi için en az " + (wordChain.game.remainingWordLimit) + " kelime daha gerekli !" + `${emojis.altarSopali}`)
            return;
        }
    }

    // SUCCESS
    message.react('✅')
    if (dictWord.length > 7 && dictWord.length < 11) message.react(emojis.cemismont);
    if (dictWord.length > 12) message.react(emojis.ebu_leheb)
    if (dictWord.length > 17) message.react(emojis.terminator)

    console.log("\nwordQuery madde " + dictWord + "\nwordQuery ID " + wordQuery._id)

    const playerUpdate = {
        userId: message.author.id,
        userTag: message.author.username,
        points: dictWord.length,
        word: dictWord
    }

    if (winFlag) {
        // award victory points
        playerUpdate.points += victoryTypes.Classic
        playerUpdate.victoryType = meta.gameType

        console.log("\nGAME OVER")

        await message.reply("Oyunu bitirdin ! " + `${emojis.cemismont}`)
        await message.channel.send(`${emojis.CS_dance}`)

        //reset game
        await message.reply("Yeniden Başlatılıyor !")

        createWordChainGame(message.channelId, wordChain.game.dict, wordChain.game.wordLimit )

    }

    await register_promise
    updatePlayerStat(message.guildId, playerUpdate)

    if(winFlag) return;

    const wordChainUpdate =  {
        wordArr: [word],
        lastAnswerer: message.author.id,
        wordCount: -1
    }

    // register both the word and the alternated, if alternate word was selected. (ex: register "kağıt" and "kağıt" both; if "kağıt" only registers as "kâğıt, it can skip usedWords check indefinitely)
    if (alternated) {
        wordChainUpdate.wordArr = [word, dictWord];
    }

    updateWordChainGame(message.channelId, wordChainUpdate)

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
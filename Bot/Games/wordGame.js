const getEmojis = require("../_helpers/getEmojis");
const dictQuery = require("../Services/dictionary.service");
const {randomStartingLetterTR, loadAnimation} = require("../_helpers/util");
const { registerUser } = require("../Services/users.service");
const { getWordChainGame, updateWordChainGame, updatePlayerStat, createWordChainGame, victoryTypes } = require("../Services/Games/wordChain.service");
const { isOneLine, isLetter, isOneWord, checkStartingLetter, sendThenDelete, replyThenDelete } = require("../_helpers/util");
const { inspect } = require('util');

const inspectOptions = {
    showHidden: false,
    depth: null,
    colors: true
}

const meta = {
    gameType: "Classic",
    isCleanMessaging: true
}
// TODO FAST MODE
async function wordGame (message, language){

    // register user
    const register_promise = registerUser(message.author.id, message.author.username)

    // get emojis
    const emojis = await getEmojis(message.client);

    const languages = {
        TR: {
            alreadyUsed: "Bu kelime zaten kullanıldı! "  + `${emojis.altarSopali}`,
            prematureEnd_1A: "oyunun bitebilmesi için en az  **",
            prematureEnd_1B: "**  kelime daha gerekli!" + `${emojis.altarSopali}`,
            prematureEnd_1C: "**  kelime daha gerekli!" + `${emojis.altarSopali}`,
            victory: "Oyunu bitirdin ! " + `${emojis.cemismont}`,
            restart: "Yeniden başlatılıyor.",
            isOneLine: 'Tek satır neyine yetmiyor!' + `${emojis.altarSopali}`,
            isLetter: 'Sadece harf kullanabilirsin!' + `${emojis.altarSopali}`,
            isOneWord: 'Sadece tek kelime kullanabilirsin!' + `${emojis.altarSopali}`,
            isLastAnswerer: 'Sen sıranı savdın!' + `${emojis.altarSopali}`,
            checkStartingLetter_1A: 'başlangıç harfi ',
            checkStartingLetter_1B: `${emojis.altarSopali}`,
            remindStartingLetter_1A: 'başlangıç harfi ',
            remindStartingLetter_1B: `${emojis.altar}`
        },

        EN: {
            alreadyUsed: "That word has already been used ! "  + `${emojis.altarSopali}`,
            prematureEnd_1A: "There need to be at least  **",
            prematureEnd_1B: "**  more words submitted before the game can end!" + `${emojis.altarSopali}`,
            prematureEnd_1C: "**  more word submitted before the game can end!" + `${emojis.altarSopali}`,
            victory: "You have ended the game! " + `${emojis.cemismont}`,
            restart: "Restarting.",
            isOneLine: 'Multiple lines are not permitted!' + `${emojis.altarSopali}`,
            isLetter: 'Only letters are allowed!' + `${emojis.altarSopali}`,
            isOneWord: 'Multiple words are not allowed!' + `${emojis.altarSopali}`,
            isLastAnswerer: 'Your turn is over!' + `${emojis.altarSopali}`,
            checkStartingLetter_1A: 'The starting letter is ',
            checkStartingLetter_1B: `${emojis.altarSopali}`,
            remindStartingLetter_1A: 'The starting letter is ',
            remindStartingLetter_1B: `${emojis.altar}`

        }
    }

    const L = languages[language.toUpperCase()];

    // validate the word
    const word = message.content.toString().toLocaleLowerCase("tr-TR");

    if(!await isWordValid(message, word, emojis, L)) return false;

    // check startingLetter and lastAnswerer
    let t0 = performance.now();
    const wordChain = await getWordChainGame(message.channelId, word)
    let t1 = performance.now();

    console.log("\ngetWordChainGame done in " + (t1 - t0) + " milliseconds.");
    console.log("getWordChainGame " + inspect(wordChain, inspectOptions));

    // check the wordChain
    if(!await isWordChainValid(message, word, message.author.id, wordChain.game.lastAnswerer, wordChain.game.startingLetter, emojis, L)) return;

    // check if the word exists in the dictionary
    t0 = performance.now();
    const { wordQuery, alternated } = await dictQuery(word); // returns null if no match is found
    t1 = performance.now();

    console.log("\nwordQuery done in " + (t1 - t0) + " milliseconds.");

    if (wordQuery === null) {
        message.react('❌')
        let reply = `${emojis.taam}`
        replyThenDelete(message, reply, meta.isCleanMessaging)
        //await remindStartingLetter(wordChain.game.startingLetter, message.channel, emojis);
        console.log("Word does not exist in the dictionary => " + wordChain.game.dict)
        return false;
    }

    // check if the word is used already
    const dictWord = wordQuery.madde.toString().toLocaleLowerCase("tr-TR");

    if (wordChain.isUsed) {

        replyThenDelete(message, L.alreadyUsed, meta.isCleanMessaging)
        console.log("\nAlready used!")
        return false;
    }

    // check win condition
    let winFlag = false;
    if ( dictWord.slice(-1) === 'ğ') {

        if ( wordChain.game.remainingWordLimit <= 0){
            winFlag = true
        }
        else {
            let reply = L.prematureEnd_1A + (wordChain.game.remainingWordLimit) + (wordChain.game.remainingWordLimit > 1 ? L.prematureEnd_1B : L.prematureEnd_1C)
            replyThenDelete(message,reply,meta.isCleanMessaging, 7000)
            return false;
        }
    }

    // SUCCESS
    message.react('✅')
    let points = dictWord.length
    if (dictWord.length > 7 && dictWord.length < 11) {message.react(emojis.cemismont); points += 5}
    if (dictWord.length > 12) {message.react(emojis.ebu_leheb); points += 8}
    if (dictWord.length > 17) {message.react(emojis.terminator); points += 15}

    console.log("\nwordQuery madde " + dictWord + "\nwordQuery ID " + wordQuery._id)

    const playerUpdate = {
        userId: message.author.id,
        userTag: message.author.username,
        points,
        word: dictWord
    }

    if (winFlag) {
        // award victory points
        playerUpdate.points += victoryTypes.classic.score
        playerUpdate.victoryType = meta.gameType

        console.log("\nGAME OVER")

        // RESET
        const nextGame = {
            channelId: message.channelId,
            dict: wordChain.game.dict,
            wordLimit: wordChain.game.wordLimit,
            startingLetter: randomStartingLetterTR()
        }

        createWordChainGame(nextGame)

        console.log( inspect(nextGame, inspectOptions) )

        languages.TR.startNotification = "KELİME ZİNCİRİ BAŞLADI!" + "\n\nSözlük: " + nextGame.dict + "\nMinimum kelime limiti: " + nextGame.wordLimit + "\n\n***Başlangıç harfi: " + nextGame.startingLetter + "***";
        languages.EN.startNotification = "WORD CHAIN HAS STARTED!" + "\n\nDictionary: " + nextGame.dict + "\nMin word limit: " + nextGame.wordLimit + "\n\n***Starting Letter: " + nextGame.startingLetter + "***";

        await message.reply(L.victory)
        await message.channel.send(`${emojis.CS_dance}` )

        const loadingMessage = await loadAnimation(message.channel, ".", 3, 1000, L.restart)

        await message.channel.send(`${emojis.ebu_leheb}`)
        await message.channel.send(L.startNotification)

    }

    await register_promise
    updatePlayerStat(message.guildId, playerUpdate)
    console.log( inspect(playerUpdate, inspectOptions) )

    if(winFlag) return "reset";

    const wordChainUpdate =  {
        startingLetter: word.slice(-1).toLocaleLowerCase("tr-TR"),
        wordArr: [word],
        lastAnswerer: message.author.id,
        wordCount: -1
    }

    // register both the word and the alternated, if alternate word was selected. (ex: register "kağıt" and "kağıt" both; if "kağıt" only registers as "kâğıt, it can skip usedWords check indefinitely)
    if (alternated) {
        wordChainUpdate.wordArr = [word, dictWord];
    }

    updateWordChainGame(message.channelId, wordChainUpdate)
    console.log( inspect(wordChainUpdate, inspectOptions) )

    return wordChainUpdate

}

async function isWordValid (message, word, emojis, L) {

    let reply
    if (!isOneLine(word)) {

        replyThenDelete(message, L.isOneLine, meta.isCleanMessaging)

        return false;
    }

    if (!isLetter(word)) {

        replyThenDelete(message, L.isLetter, meta.isCleanMessaging)

        return false;
    }

    if (!isOneWord(word)) {


        replyThenDelete(message, L.isOneWord, meta.isCleanMessaging)

        return false
    }
    return true
}

async function isWordChainValid (message, word, playerID, lastAnswerer, startingLetter, emojis, L) {

    // TODO temporarily disabled  -playerID should be object
    let reply
    if (lastAnswerer === "playerID") {

        replyThenDelete(message, L.lastAnswerer, meta.isCleanMessaging)

        return false
    }

    if (!checkStartingLetter(word, startingLetter)) {

        reply = L.checkStartingLetter_1A + `**${startingLetter.toLocaleUpperCase("tr-TR")}**` + L.checkStartingLetter_1B
        replyThenDelete(message,reply,meta.isCleanMessaging)

        return false
    }
    return true
}

async function remindStartingLetter(startingLetter, channel, emojis, L) {

    channel.send({
        content: L.remindStartingLetter
    })
}

module.exports = { wordGame }
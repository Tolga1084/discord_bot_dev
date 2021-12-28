const getEmojis = require("../_helpers/getEmojis");
const {getChannel} = require("../Services/channel.service");
const dictQuery = require("../Services/dictionary.service");
const {isOneLine, isLetter, isOneWord, checkStartingLetter} = require("../_helpers/util");


async function wordGame (message){

    const emojis = await getEmojis(message.guild);
    const word = message.content.toString().toLocaleLowerCase("tr-TR");

    if(!await isWordValid(word, emojis)) return;

    // check startingLetter and lastAnswerer
    let t0 = performance.now();
    const channel = await getChannel(message.channelId)
    let t1 = performance.now();
    console.log("\nchannel Query done in " + (t1 - t0) + " milliseconds.");
    console.log("getChannel " + JSON.stringify(channel));
    if(!await isWordChainValid(message, word, message.author.id, channel.lastAnswerer, channel.startingLetter, emojis)) return;

    // check if the word was used already
    t0 = performance.now();
    const isUsed = await getChannel(message.channelId, word)
    t1 = performance.now();
    console.log("\nisUsed getChannel done in " + (t1 - t0) + " milliseconds.");

    if (isUsed) {
        message.reply({
            content: 'bu kelime zaten kullanıldı!' + `${emojis.altarSopali}`
        })
        return;
    }

    // check if the word exists in the dictionary
    t0 = performance.now();
    const wordQuery = await dictQuery(word); // returns null if no match is found
    t1 = performance.now();
    console.log("\nwordQuery done in " + (t1 - t0) + " milliseconds.");

    if (wordQuery === null) {
        await message.reply(`${emojis.taam}`);
        await remindStartingLetter(channel.startingLetter, channel.channel, emojis);
        return;
    }else console.log("\nwordQuery madde" + wordQuery.madde + " \nwordQuery ID " + wordQuery._id)



    console.log("\nreached end")
}

async function isWordValid (word, emojis) {

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

    if (lastAnswerer === playerID) {

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

module.exports = { wordGame, remindStartingLetter }
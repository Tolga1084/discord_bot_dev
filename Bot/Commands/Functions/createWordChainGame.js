const { randomStartingLetterTR, getKeyByValue } = require("../../_helpers/util");
const { getConfirmationButton } = require("../Buttons/ConfirmationButton");
const { getChannel,  gameEnum, createChannel } = require("../../Services/channel.service");
const { createWordChainGame } = require("../../Services/Games/wordChain.service")
const getEmojis = require("../../_helpers/getEmojis");


async function startWordChainGame (interaction, buttonDuration, language){

    console.log( "\n CREATE WORD CHAIN GAME => " + interaction.channel.name + "\t" + interaction.channelId +  "\n")

    const emojis = await getEmojis(interaction.client);

    const languages = {
        TR: {
            subCommand_dictionary: "sözlük",
            subCommand_min_word_limit: "min_kelime_limiti",
            content_1A: `		 ***DİKKAT***		` + "\nBu kanalda zaten oyun oynanıyor!",
            content_1B: "Yeni bir oyun başlatırsan, bu oyunu sonlandırmış olacaksın! Devam etmek istiyorsan **'BAŞLAT'** tuşuna bas" + `${emojis.altar}`,
            wordChain: "Kelime Zinciri"
        },

        EN: {
            subCommand_dictionary: "dictionary",
            subCommand_min_word_limit: "min_word_limit",
            content_1A: `		 ***WARNING***		` + "\nThere is already an active game on this channel!",
            content_1B: "\nStarting a new game will terminate it. Press the **'START'** button, if you wish to proceed." + `${emojis.altar}`,
            wordChain: "Word Chain"
        }
    }

    const L = languages[language.toUpperCase()];

    const channel = await getChannel(interaction.channelId)
    const dict = interaction.options.getString(L.subCommand_dictionary)
    const wordLimit = interaction.options.getInteger(L.subCommand_min_word_limit)
    const startingLetter = await randomStartingLetterTR();

    languages.TR.startNotification = "KELİME ZİNCİRİ BAŞLADI!"+ `${emojis.ebu_leheb}` + "\n\nSözlük: " + dict + "\nMinimum kelime limiti: " + wordLimit + "\n\n***Başlangıç harfi:*** " + "***" + startingLetter + "***";
    languages.EN.startNotification = "WORD CHAIN HAS STARTED!" + `${emojis.ebu_leheb}`+ "\n\nDictionary: " + dict + "\nMin word limit: " + wordLimit + "\n\n***Starting Letter:*** " + "***" + startingLetter + "***" ;
    //L.startNotification = languages[language.toUpperCase()].startNotification;

    //if there is already an active game session

    const wordChainGame = {
        channelId: interaction.channelId,
        dict,
        wordLimit,
        startingLetter,
    }

    if (channel) {
        if (channel.isActive) {
            const collectorFunction = function () {

                createWordChainGame(wordChainGame)
                console.log(languages.EN.startNotification+ interaction.channel.name + "\t" + interaction.channelId +  "\n")
            }
            const row = await getConfirmationButton(interaction, "START", "DANGER", buttonDuration, collectorFunction, L.startNotification, undefined , language)

            await interaction.reply({
                content: L.content_1A + " - **" + L[getKeyByValue(gameEnum, channel.activeGame)] + "** -\n" + L.content_1B,
                components: [row]
            })
        }else {
            await createWordChainGame(wordChainGame);
            console.log(languages.EN.startNotification+ interaction.channel.name + "\t" + interaction.channelId +  "\n")

            await interaction.reply(L.startNotification);
        }
    }else {
        await createChannel(interaction.channel);
        console.log("Created Channel\n" + interaction.channel.name + "\t" + interaction.channelId +  "\n")

        await createWordChainGame(wordChainGame);
        console.log(languages.EN.startNotification+ interaction.channel.name + "\t" + interaction.channelId +  "\n")

        await interaction.reply(L.startNotification);
    }
}

module.exports = startWordChainGame
const { randomStartingLetterTR, getKeyByValue } = require("../../_helpers/util");
const { getConfirmationButton } = require("../Buttons/ConfirmationButton");
const { getChannel,  gameEnum, createChannel } = require("../../Services/channel.service");
const { createWordChainGame, requirements } = require("../../Services/Games/wordChain.service")
const getEmojis = require("../../_helpers/getEmojis");
const { inspect } = require('util');

const inspectOptions = {
    showHidden: false,
    depth: null,
    colors: true
}

async function startWordChainGame (interaction, buttonDuration, language){

    console.log( "\n ------------- CREATE WORD CHAIN GAME -------------  \n" +
        "CHANNEL => " + interaction.channel.name + "\t /ID: " + interaction.channelId +  "\n\n")

    const emojis = await getEmojis(interaction.client);

    const languages = {
        TR: {
            subCommand_dictionary: "sözlük",
            subCommand_min_word_limit: "min_kelime_limiti",
            subCommand_deletion_delay: "silme_süresi",
            content_1A: `		 ***DİKKAT***		` + "\nBu kanalda zaten oyun oynanıyor!",
            content_1B: "Yeni bir oyun başlatırsan, bu oyunu sonlandırmış olacaksın! Devam etmek istiyorsan **'BAŞLAT'** tuşuna bas" + `${emojis.altar}`,
            wordChain: "Kelime Zinciri",
            button_start: "BAŞLAT"
        },

        EN: {
            subCommand_dictionary: "dictionary",
            subCommand_min_word_limit: "min_word_limit",
            subCommand_deletion_delay: "deletion_delay",
            content_1A: `		 ***WARNING***		` + "\nThere is already an active game on this channel!",
            content_1B: "\nStarting a new game will terminate it. Press the **'START'** button, if you wish to proceed." + `${emojis.altar}`,
            wordChain: "Word Chain",
            button_start: "START"
        }
    }

    const L = languages[language.toUpperCase()];

    const channel = await getChannel(interaction.channelId)
    const dict = interaction.options.getString(L.subCommand_dictionary)
    const wordLimit = interaction.options.getInteger(L.subCommand_min_word_limit)
    const deletionDelayInput = interaction.options.getInteger(L.subCommand_deletion_delay)
    const startingLetter = randomStartingLetterTR()

    console.log("DICT            => " + dict + "\n" +
                "WORD_LIMIT      => " + wordLimit + "\n" +
                "STARTING_LETTER => " + startingLetter + "\n" +
                "DELETION_DELAY  => " + deletionDelayInput + "\n\n")

    languages.TR.wordLimitError = "Kelime limiti, 10 ila 1000 arasında olmalı ! "  + `${emojis.altarSopali}`;
    languages.EN.wordLimitError = "Word limit has to be between 10 and 1000 ! "  + `${emojis.altarSopali}`;

    languages.TR.deletionDelayError = "Silme süresi, 0 ila 30 arasında olmalı ! "  + `${emojis.altarSopali}`;
    languages.EN.deletionDelayError = "Deletion delay has to be between 0 and 30 ! "  + `${emojis.altarSopali}`;

    if ( (wordLimit < requirements.wordLimitRange.min) || (wordLimit > requirements.wordLimitRange.max) ) {
        interaction.reply({
            content: L.wordLimitError
            })
        throw "wordLimit out of Range ! " + inspect(requirements.wordLimitRange, inspectOptions)
    }

    if ( (deletionDelayInput < requirements.deletionDelay.min) || (deletionDelayInput > requirements.deletionDelay.max) ) {
        interaction.reply({
            content: L.deletionDelayError
        })
        throw "deletionDelay out of Range ! " + inspect(deletionDelayInput, inspectOptions)
    }

    languages.TR.startNotification = "KELİME ZİNCİRİ BAŞLADI!"+ "\n\nSözlük: " + dict + "\nMinimum kelime limiti: " + wordLimit + "\n\n***Başlangıç harfi:*** " + "***" + startingLetter + "***";
    languages.EN.startNotification = "WORD CHAIN HAS STARTED!" + "\n\nDictionary: " + dict + "\nMin word limit: " + wordLimit + "\n\n***Starting Letter:*** " + "***" + startingLetter + "***";

    //if there is already an active game session

    const wordChainGame = {
        channelId: interaction.channelId,
        dict,
        wordLimit,
        startingLetter,
        deletionDelay: deletionDelayInput * 1000  // convert ms to second
    }

    const start = function () {

        createWordChainGame(wordChainGame)
        console.log(languages.EN.startNotification + "\n")

        interaction.reply(L.startNotification);
        interaction.channel.send(`${emojis.ebu_leheb}`)
    }

    if (channel) {
        if (channel.isActive) {

            const row = await getConfirmationButton(interaction, L.button_start, "DANGER", buttonDuration, start, L.startNotification, language)

            await interaction.reply({
                content: L.content_1A + " - **" + L[getKeyByValue(gameEnum, channel.activeGame)] + "** -\n" + L.content_1B,
                components: [row]
            })

        }else start()

    }else {
        await createChannel(interaction.channel);
        console.log("Created Channel" + "\n")

        start()
    }
}

module.exports = startWordChainGame
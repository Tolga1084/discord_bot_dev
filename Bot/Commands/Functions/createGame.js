const { randomStartingLetterTR } = require("../../_helpers/util");
const { getConfirmationButton } = require("../Buttons/ConfirmationButton");
const { getChannel, changeChannelState, registerActiveChannel } = require("../../Services/channel.service");
const getEmojis = require("../../_helpers/getEmojis");


async function createGame (interaction, buttonDuration, language){

    const emojis = await getEmojis(interaction.client);

    const languages = {
        TR: {
            subCommand_dictionary: "sözlük",
            subCommand_min_word_limit: "min_kelime_limiti",
            content_1: `		 ***DİKKAT***		` + "\nBu kanalda zaten oyun oynanıyor!\n" +
                "Yeni bir oyun başlatırsan, bu oyunu sonlandırmış olacaksın! Devam etmek istiyorsan *'BAŞLAT'* tuşuna bas" + `${emojis.altar}`
        },

        EN: {
            subCommand_dictionary: "dictionary",
            subCommand_min_word_limit: "min_word_limit",
            content_1: `		 ***WARNING***		` + "\nThere is already an active session on this channel!\n" +
                "Starting a new session will terminate it. Press the START button, if you wish to proceed." + `${emojis.altar}`
        }
    }
    const L = languages[language.toUpperCase()];

    const channel = await getChannel(interaction.channelId)
    const dict = interaction.options.getString(L.subCommand_dictionary)
    const wordLimit = interaction.options.getInteger(L.subCommand_min_word_limit)
    const startingLetter = await randomStartingLetterTR();

    languages.TR.startNotification = "OYUN BAŞLADI!"+ `${emojis.ebu_leheb}` + "\nBaşlangıç harfi: " + startingLetter + "\nSözlük: " + dict + "\nMinimum kelime limiti: " + wordLimit;
    languages.EN.startNotification = "The game has started!" + `${emojis.ebu_leheb}`+ "StartingLetter: " + startingLetter + " Dictionary: " + dict + ", Min word limit: " + wordLimit;
    L.startNotification = languages[language.toUpperCase()].startNotification;

    //if there is already an active game session
    if (channel) {
        if (channel.isActive) {
            const collectorFunction = function () {
                return changeChannelState(interaction.channelId, undefined, true, dict, wordLimit, startingLetter)
            }
            const row = await getConfirmationButton(interaction, "START", "DANGER", buttonDuration, collectorFunction, L.startNotification)

            await interaction.reply({
                content: L.content_1,
                components: [row]
            })
        }else {
            await changeChannelState(interaction.channelId, undefined, true, dict, wordLimit,  startingLetter);
            await interaction.reply(startNotification);
        }
    }else {
        await registerActiveChannel(interaction.channelId, interaction.guildId, undefined, true, dict, wordLimit, startingLetter, null);
        await interaction.reply(startNotification);
    }
}

module.exports = createGame
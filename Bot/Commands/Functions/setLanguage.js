const getEmojis  = require("../../_helpers/getEmojis");
const deployCommands = require("../Util/deployCommands");
const {replyThenDelete} = require("../../_helpers/util");
const { updateGuild } = require("../../Services/guild.service");

const flagTR = ":flag_tr:"
const flagEN = ":flag_gb:"

async function setLanguage (interaction, language) {

    const emojis = await getEmojis(interaction.client)
    const languages = {
        TR: {
            subCommand_language: "dil",
            success: "Artık, Türkçe konuşuyorum. Komutlar da Türkçe! " + flagTR,
            repeated: "Zaten Türkçe konuşuyorum! " + flagTR,
            failure: "Bir şeyler yanlış gitti!" + `${emojis.HC_fine}`
        },
        EN: {
            subCommand_language: "language",
            success: "I now speak English! Commands are in English too! " + flagEN,
            repeated: "I already speak English! " + flagEN,
            failure: "Something went wrong!" + `${emojis.HC_fine}`
        }
    }

    const L = languages[language.toUpperCase()];

    const interfaceLanguage = interaction.options.getString(L.subCommand_language)

    try {
        const result = await updateGuild(interaction.guild, {interfaceLanguage})
        if (!result.modifiedCount) replyThenDelete(interaction, L.repeated )
        else {
            deployCommands(process.env.clientID, interaction.guildId, interfaceLanguage, true )
            replyThenDelete(interaction, languages[interfaceLanguage.toUpperCase()].success)
        }
    } catch (err) {
        console.log(err)
        replyThenDelete(interaction, L.failure)
    }
}

module.exports = {setLanguage}
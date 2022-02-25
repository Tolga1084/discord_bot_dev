const { ms } = require("../../_helpers/util.js")
const { MessageActionRow, MessageButton } = require('discord.js')
const deleteTimer = 10000;

async function getConfirmationButton(interaction, label, style, duration, collectorFunction, update, language){

    const uniqueID = interaction.channelId + interaction.user.id + ms();

    const languages = {
        TR: {
            warning1: "Çek elini! Başkasının butonu o!",
            warning2: "Bu etkileşim, zaman aşımına uğradı!",
        },

        EN: {
            warning1: "That button is not for you!",
            warning2: "This interaction has timed out!"
        }
    }

    const L = languages[language.toUpperCase()];
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId(uniqueID)
                .setLabel(label)
                .setStyle(style),
        );

    const filter = button => {
        const isValidUser = (button.customId === uniqueID )&&(button.user.id === interaction.user.id);
        if (!isValidUser) button.reply({content: L.warning1, ephemeral:true});
        return isValidUser ;
    };

    const collector = interaction.channel.createMessageComponentCollector({
        filter,
        componentType: 'BUTTON',
        time: duration,
        max: 1
    });

    let isClicked = false;

    collector.on('collect', button => {
        button.deferUpdate();
        isClicked = true;
        row.components[0].setDisabled(true);
        collectorFunction();
        interaction.editReply({content: update, components: [row]})
    });

    setTimeout( () => {
        row.components[0].setDisabled(true);
        collector.stop();
        if (!isClicked) {
            interaction.editReply({content: L.warning2, components: [row]})
            setTimeout(() => {
                try {
                    interaction.deleteReply()
                }
                catch (err){console.log("confirmationButton setTimeout deleteTimer failed: " + err)}
            }, deleteTimer)
        }
    }, duration)

    return row;
}

module.exports = { getConfirmationButton };
const { ms } = require("../../_helpers/util.js")
const { MessageActionRow, MessageButton } = require('discord.js')

async function getConfirmationButton(interaction, label, style, cooldownTimer, collectorFunction, update){

    const uniqueID = interaction.channelId + interaction.user.id + ms();

    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId(uniqueID)
                .setLabel(label)
                .setStyle(style),
        );

    const filter = button => {
        return (button.customId === uniqueID )&&(button.user.id === interaction.user.id) ;
    };

    const collector = interaction.channel.createMessageComponentCollector({
        filter,
        componentType: 'BUTTON',
        time: cooldownTimer,
        max: 1
    });

    let isClicked = false;

    collector.on('collect', button => {
        button.deferUpdate();
        isClicked = true;
        row.components[0].setDisabled(true);
        collectorFunction();
        interaction.editReply({content: update, components: [row]});
    });

    setTimeout( () => {
        row.components[0].setDisabled(true);
        if (!isClicked) interaction.editReply({content: "This interaction has timed out!", components: [row]});
    }, cooldownTimer)

    return row;
}

module.exports = { getConfirmationButton };
const { getConfirmationButton } = require("./Buttons/ConfirmationButton");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { getChannel, getActiveChannels, changeChannelState } = require("../Services/channel.service");


module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Terminates the game')
        .addSubcommand(subcommand =>
            subcommand
                .setName('here')
                .setDescription('Terminates the game on this channel'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('all')
                .setDescription('Terminates the games on every channel')),
    async execute(interaction, buttonDuration) {

        if (interaction.options.getSubcommand() === 'here'){

            const channel = await getChannel(interaction.channelId);

            if(channel){
                if(channel.isActive){
                    await changeChannelState(interaction.channelId, undefined, false)
                    interaction.reply("The game has been terminated!")
                    return;
                }
            }
            interaction.reply("There is currently no active session on this channel!")
        }

        if (interaction.options.getSubcommand() === 'all'){

            const channels = await getActiveChannels(interaction.guildId);
            console.log("stopGame getActiveChannels: " + JSON.stringify(await channels))

            await channels.count(async function(err, count) {
                if(err) {
                    console.log("ERROR stopGame all:" + err + "\nERROR stopGame all interaction: " + interaction);
                }
                console.log("stopGame channels.count: " + count)
                if(count >= 1){
                    let message = "Would you like to terminate the games in these channels?\n\n"

                    const activeChannels = [];

                    for await (const channel of channels) {

                        console.log("stopGame forEach channel" + JSON.stringify(channel))
                        activeChannels.push(channel._id)
                        message += channel.name + "\t" + channel.dict + "\t" + channel.wordLimit + "\n";
                        console.log("stopGame inside-forEach message: " + message);
                        console.log("stopGame inside-activeChannels" + activeChannels);

                    }

                    console.log("stopGame activeChannels" + activeChannels);
                    const collectorFunction = function () {
                        // TODO implement bulkwrite method?
                        activeChannels.forEach(channelID => {
                            changeChannelState(channelID, false);
                        })
                    }
                    // TODO inform the channels in which the games had been playing out, that the games have been terminated
                    const update = "The games have been stopped!";
                    const row = await getConfirmationButton(interaction, 'STOP', 'DANGER', buttonDuration, collectorFunction, update);
                    console.log("stopGame forEach message: " + message);
                    await interaction.reply({content: message, components: [row]});

                }
                if(count === 0) await interaction.reply("There are no active sessions on any channel!");
            });
        }
    }
}
const { getConfirmationButton } = require("./Buttons/ConfirmationButton");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { getChannel, getActiveChannels, changeChannelState } = require("../Services/channel.service");
const { cooldown } = require("./Util/commandUtil.js")
const talkedRecently = new Set();

// CONFIG
const cooldownTimer = 30000;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stops the game on the channel this command is called.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('all')
                .setDescription('Stops the games on every channel')),
    async execute(interaction) {
        // TODO channel specific cooldown?
        //if(cooldown(interaction,talkedRecently, cooldownTimer)) return;

        if (interaction.options.getSubcommand() === 'all'){

            const channels = await getActiveChannels(interaction.guildId);
            console.log("stopGame getActiveChannels: " + JSON.stringify(await channels))

            await channels.count(async function(err, count) {

                console.log("stopGame channels.count: " + count)
                if(count >= 1){
                    let message = "Would you like to stop the games in these channels?\n\n"

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
                            changeChannelState(interaction.guildId, channelID, false);
                        })
                    }

                    const update = "Games are stopped";
                    const row = await getConfirmationButton(interaction, 'STOP', 'DANGER', cooldownTimer, collectorFunction, update);
                    console.log("stopGame forEach message: " + message);
                    await interaction.reply({content: message, components: [row]});

                    if(count === 0) await interaction.reply("There are no active sessions on any channel!");

                }
                if(err) {
                    console.log("ERROR stopGame all:" + err + "\nERROR stopGame all interaction: " + interaction);
                }

            });
        }

        /*
        const channel = await getChannel(interaction.guildId, interaction.channelId);

        if(channel){
            if(!channel.isActive){
                interaction.reply("There is currently no active session on this channel!")
                return;
            }
        }

        await changeChannelState(interaction.guildId, interaction.channelId, false);*/

    }
}
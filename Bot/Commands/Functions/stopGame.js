const { getChannel, getActiveChannels, deactivateChannel } = require("../../Services/channel.service");
const getEmojis  = require("../../_helpers/getEmojis");
const { getConfirmationButton } = require(".././Buttons/ConfirmationButton");


async function stopGame (interaction, buttonDuration, language) {

    const emojis = await getEmojis(interaction.client);

    const languages = {

        TR: {
            subCommand_here: "bu_kanalda",
            subCommand_all: "her_kanalda",
            terminateNotification_1: "Oyun bitti! Dağılın!",
            noGamesFound_1: "Bu kanalda oyun falan yok zaten!",
            confirmation_1: "Bu oyunları sonlandırayım mı?",
            terminateNotification_2: "Bu kanaldaki oyun, " + `${interaction.user.tag}` + "tarafından sonlandırıldı.\nHadi evlerinize dağılın.",
            terminateNotification_3: "Oyunlar sonlandırıldı!",
            noGamesFound2: "Oyun falan yok hiçbir yerde!"
        },

        EN: {
            subCommand_here: "here",
            subCommand_all: "everywhere",
            terminateNotification_1: "The game has been terminated!",
            noGamesFound_1: "There is currently no active session on this channel!",
            confirmation_1: "Would you like to terminate the games in these channels?",
            terminateNotification_2: "The game on this channel has been terminated by " + `${interaction.user.tag}` + "\nDisperse immediately.",
            terminateNotification_3: "The games have been stopped!",
            noGamesFound2: "There are no active sessions on any channel!"
        }
    }
    const L = languages[language.toUpperCase()];

    if (interaction.options.getSubcommand() === L.subCommand_here){

        const channel = await getChannel(interaction.channelId);
        if(channel){
            if(channel.isActive){
                await deactivateChannel(interaction.channelId)
                interaction.reply(L.terminateNotification_1).then(() => {
                    interaction.channel.send(`${emojis.terminator}`)
                })
                return;
            }
        }
        interaction.reply(L.noGamesFound_1)
    }

    if (interaction.options.getSubcommand() === L.subCommand_all){

        const channels = await getActiveChannels(interaction.guildId);
        console.log("stopGame getActiveChannels: " + JSON.stringify(await channels))

        await channels.count(async function(err, count) {
            if(err) {
                console.log("ERROR stopGame all:" + err + "\nERROR stopGame all interaction: " + interaction);
            }
            console.log("stopGame channels.count: " + count)
            if(count >= 1){
                let message = L.confirmation_1 + "\n\n";

                const activeChannels = [];

                for await (const channel of channels) {

                    console.log("stopGame forEach channel" + JSON.stringify(channel))
                    activeChannels.push(channel)
                    message += channel.name + "\t" + channel.activeGame + "\n";
                    console.log("stopGame inside-forEach message: " + message);
                    console.log("stopGame inside-activeChannels" + activeChannels);

                }

                console.log("stopGame activeChannels" + activeChannels);
                const collectorFunction = function () {
                    // TODO implement bulkwrite method?
                    activeChannels.forEach(channel => {
                        deactivateChannel(channel._id);
                        interaction.client.channels.fetch(channel._id)
                        interaction.client.channels.cache.get(channel._id).send(L.terminateNotification_2).then(() => { //TODO disable mention notifications
                        interaction.client.channels.cache.get(channel._id).send(`${emojis.terminator}`)
                        })
                    })
                }

                const update = L.terminateNotification_3 + ` ${emojis.altar}`;
                const row = await getConfirmationButton(interaction, 'STOP', 'DANGER', buttonDuration, collectorFunction, update, language);
                console.log("stopGame forEach message: " + message);
                await interaction.reply({content: message, components: [row]});
            }
            if(count === 0) await interaction.reply(L.noGamesFound2 + ` ${emojis.altar}`);
        });
    }
}

module.exports = stopGame
const { Routes } = require('discord-api-types/v9');
const rest = require("../../_helpers/getREST")
const commandsJsonData = require("./getCommands").getCommandsJsonData

module.exports = async (clientID,guildID) => {

    const commands = commandsJsonData();

    try {
        console.log('Started refreshing application (/) Commands. guildID: '+guildID);

        await rest.put(
            Routes.applicationGuildCommands(clientID, guildID),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) Commands. guildID: '+guildID);
    } catch (error) {
        console.error(error);
    }
}
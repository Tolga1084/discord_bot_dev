const { Routes } = require('discord-api-types/v9');
const rest = require("../../_helpers/getREST")
const commandsJsonData = require("./getCommands").getCommandsJsonData

module.exports = async (clientID, guildID, language, log) => {

    const commands = commandsJsonData(language);
        if (log)
        console.log('Started refreshing application (/) Commands. guildID: '+guildID);

        await rest.put(
            Routes.applicationGuildCommands(clientID, guildID),
            { body: commands },
        );
        if (log)
        console.log('Successfully reloaded application (/) Commands. guildID: '+guildID);
        return true

}
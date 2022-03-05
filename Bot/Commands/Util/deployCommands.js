const { Routes } = require('discord-api-types/v9');
const rest = require("../../_helpers/getREST")
const commandsJsonData = require("./getCommands").getCommandsJsonData

async function deployCommands (clientID, guildID, language, log, loopCount) {

    if (log)
        JSON.stringify(commandsJsonData)

    const commands = commandsJsonData(language);
    try {
        if (log)
            console.log('Started refreshing application (/) Commands. guildID: ' + guildID);

        const result = await rest.put(
            Routes.applicationGuildCommands(clientID, guildID),
            {body: commands},
        );
        if (log)
            console.log('Successfully reloaded application (/) Commands. guildID: ' + guildID);
        return true
    } catch (error) {
        if (log)
        console.log(error)
        console.log("trying again in 5 seconds...")

        if (!loopCount)
            loopCount = 1

        else if(loopCount < 5)
        await setTimeout(() => {deployCommands(clientID, guildID, language, log, ++loopCount)}, 5000);

        else {
            console.log("failed to deploy commands on " + guildID)
            throw error
        }
    }
}

module.exports = deployCommands
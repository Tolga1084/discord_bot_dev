const fs = require('fs');
const path = require("path");
const commandsPath = path.resolve(__dirname, "../");

function getCommands() {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    const commands = [];

    for (const file of commandFiles) {
        const command = require(`${commandsPath}/${file}`);
        commands.push(command);
    }

    return commands;
}

function getCommandsJsonData(language) {

    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith("_"+language+".js"));
    const commandsJsonData = [];

    for (const file of commandFiles) {
        const command = require(`${commandsPath}/${file}`);
        commandsJsonData.push(command.data.toJSON());
    }

    return commandsJsonData;
}

module.exports = {getCommands,getCommandsJsonData};
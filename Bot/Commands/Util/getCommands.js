const fs = require('fs');
const commandsPath = "E:/discord_bot_dev/Bot/Commands";


function getCommands() {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    const commands = [];

    for (const file of commandFiles) {
        const command = require(`${commandsPath}/${file}`);
        commands.push(command);
    }

    return commands;
}

function getCommandsJsonData() {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    const commandsJsonData = [];

    for (const file of commandFiles) {
        const command = require(`${commandsPath}/${file}`);
        commandsJsonData.push(command.data.toJSON());
    }

    return commandsJsonData;
}

module.exports = {getCommands,getCommandsJsonData};
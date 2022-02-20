const { createGuild } = require('../Services/guild.service.js')
const deployCommands = require('../Commands/Util/deployCommands.js')

// TODO name change events for guilds and channels
module.exports = {
    name: "guildCreate",
    async execute(guild) {

        console.log("joined "+ guild.name)

        createGuild(guild)

        deployCommands(process.env.clientID, guild.id, "EN", true)
    }
}
const { createGuild } = require('../Services/guild.service.js')
const deployCommands = require('../Commands/Util/deployCommands.js')

// TODO name change events for guilds and channels
module.exports = {
    name: "guildCreate",
    async execute(guild) {

        createGuild(guild)

        const result = await deployCommands(process.env.clientID, guild.id, "EN", true)
        if (result)
            console.log("")
    }
}
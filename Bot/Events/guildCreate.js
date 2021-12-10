const { guildCreate } = require('../Services/guild.services.js')
const deployCommands = require('../Commands/Util/deployCommands.js')

module.exports = {
    name: "guildCreate",
    async execute(guild) {

        console.log("joined "+ guild.name)

        guildCreate(guild)

        deployCommands(process.env.clientID, guild.id)
    }
}
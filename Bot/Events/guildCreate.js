const registerGuild = require('../Services/guild.services.js').createGuild
const deployCommands = require('../Commands/Util/deployCommands.js')

module.exports = {
    name: "guildCreate",
    async execute(guild) {

        console.log("joined "+ guild.name)

        registerGuild(guild)

        deployCommands(process.env.clientID, guild.id)
    }
}
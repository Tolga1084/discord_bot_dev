const { removeGuild } = require('../Services/guild.services.js')

module.exports = {
    name: "guildDelete",
    async execute(guild) {
        console.log("left "+ guild.name)
        removeGuild(guild)
    }
}
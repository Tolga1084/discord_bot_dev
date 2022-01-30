const { removeGuild } = require('../Services/guild.service.js')

module.exports = {
    name: "guildDelete",
    async execute(guild) {
        console.log("left "+ guild.name)
        removeGuild(guild)
    }
}
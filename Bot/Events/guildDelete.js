const { removeGuild } = require('../Services/guild.service.js')

module.exports = {
    name: "guildDelete",
    async execute(guild) {
        removeGuild(guild)
    }
}
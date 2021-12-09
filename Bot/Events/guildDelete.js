const removeGuild = require('../Services/guild.services.js').removeGuild

module.exports = {
    name: "guildDelete",
    async execute(guild) {
        console.log("left "+ guild.name)
        removeGuild(guild)
    }
}
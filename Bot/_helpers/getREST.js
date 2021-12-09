const { REST } = require('@discordjs/rest');
const DISCORD_TOKEN = process.env['DISCORD_TOKEN_TEST']

module.exports = new REST({ version: '9' }).setToken(DISCORD_TOKEN);
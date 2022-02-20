const { SlashCommandBuilder } = require('@discordjs/builders');
const stopGame = require("./Functions/stopGame.js")


module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Terminates games on either this or every channel.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('here')
                .setDescription('Terminates the game on this channel.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('everywhere')
                .setDescription('Terminates games on every channel')),
    async execute(interaction, buttonDuration) {

        await stopGame(interaction,buttonDuration,"EN")
    }
}
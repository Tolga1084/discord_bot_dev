const { SlashCommandBuilder } = require('@discordjs/builders');
const stopGame = require("./Functions/stopGame.js")


module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Terminates games on either this or each channel.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('here')
                .setDescription('Terminates the game on this channel.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('everywhere')
                .setDescription('Terminates games on each channel')),
    async execute(interaction, buttonDuration) {

        await stopGame(interaction,buttonDuration,"EN")
    }
}
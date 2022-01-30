const { SlashCommandBuilder } = require('@discordjs/builders');
const stopGame = require("./Functions/stopGame");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('durdur')
        .setDescription("Bu kanaldaki veya her kanaldaki oyunları sonlandırır.")
        .addSubcommand(subcommand =>
            subcommand
                .setName('bu_kanalda')
                .setDescription("Bu kanaldaki oyunu sonlandırır."))
        .addSubcommand(subcommand =>
            subcommand
                .setName('her_kanalda')
                .setDescription("Her kanaldaki oyunları sonlandırır.")),
    async execute(interaction, buttonDuration) {

        await stopGame(interaction, buttonDuration, "TR")
    }
}
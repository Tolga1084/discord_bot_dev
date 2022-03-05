const { SlashCommandBuilder } = require('@discordjs/builders');
const scoreBoard = require("./Functions/scoreBoard");
const {gameEnum } = require("../Services/channel.service.js");

module.exports = {

    data: new SlashCommandBuilder()
        .setName('score')
        .setDescription('Displays scoreboard of a game //')
            .addStringOption(option =>
                option.setName('game')
                    .setDescription('Select the game to display its scoreboard (server-wide)')
                    .setRequired(true)
                    .addChoice('word_chain', 'Word Chain')),

    execute: async function (interaction, buttonDuration) {

            await scoreBoard(interaction, "EN", interaction.options.getString("game"))
    }
}
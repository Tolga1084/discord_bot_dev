const { SlashCommandBuilder } = require('@discordjs/builders');
const createGame = require("./Functions/createGame");

module.exports = {

	data: new SlashCommandBuilder()
		.setName('start')
		.setDescription('Starts a game on this channel. //')
		.addStringOption(option =>
			option.setName('dictionary')
				.setDescription('Selects a dictionary for reference.')
				.setRequired(true)
				.addChoice('TR', 'TR'))
		.addIntegerOption(option =>
			option.setName('min_word_limit')
				.setDescription('Min word count before the game can end.')
				.setRequired(true)),
	execute: async function (interaction, buttonDuration) {

		await createGame(interaction, buttonDuration, "EN")
	}
}
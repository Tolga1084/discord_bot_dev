const { SlashCommandBuilder } = require('@discordjs/builders');
const startWordChainGame = require("./Functions/startWordChainGame");

module.exports = {

	data: new SlashCommandBuilder()
		.setName('start')
		.setDescription('Starts a game on this channel. //')
		.addSubcommand(subcommand =>
			subcommand.setName('word_chain')
				.setDescription('starts "Word Chain" Game')
				.addStringOption(option =>
					option.setName('dictionary')
						.setDescription('Selects a dictionary for reference.')
						.setRequired(true)
						.addChoice('TR', 'TR'))
				.addIntegerOption(option =>
					option.setName('deletion_delay')
						.setDescription('seconds before messages are deleted ("0" disables bot replies, "30" disables deleting)')
						.setRequired(true))
				.addIntegerOption(option =>
					option.setName('min_word_limit')
						.setDescription('Min word count before the game can end.')
						.setRequired(true))
		),

	execute: async function (interaction, buttonDuration) {

		if(interaction.options.getSubcommand() === "word_chain")
		await startWordChainGame(interaction, buttonDuration, "EN")
	}
}
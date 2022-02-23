const { SlashCommandBuilder } = require('@discordjs/builders');
const startWordChainGame = require("./Functions/createWordChainGame");

module.exports = {

	data: new SlashCommandBuilder()
		.setName('başlat')
		.setDescription('Bu kanalda bir oyun başlatır.')
		.addSubcommand(subcommand =>
			subcommand.setName('word_chain')
				.setDescription('"Word Chain" oyununu başlatır')
				.addStringOption(option =>
					option.setName('sözlük')
						.setDescription('Referans sözlük seçer')
						.setRequired(true)
						.addChoice('TR', 'TR'))
				.addIntegerOption(option =>
					option.setName('min_kelime_limiti')
						.setDescription('Oyunun bitmesi için gerekli asgari kelime sayısı. (min: 10, max:1000)')
						.setRequired(true)),
		),

	execute: async function (interaction, buttonDuration) {

		if( await interaction.options.getSubcommand() === "word_chain")
		await startWordChainGame(interaction, buttonDuration, "TR")
	}
}
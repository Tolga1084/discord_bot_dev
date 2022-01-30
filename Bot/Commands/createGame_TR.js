const { SlashCommandBuilder } = require('@discordjs/builders');
const createGame = require("./Functions/createWordChainGame");

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
						.setDescription('Oyunun bitmesi için gerekli minimum kelime sayısı.')
						.setRequired(true)),
		),

	execute: async function (interaction, buttonDuration) {

		if(interaction.options.getSubcommand === "word_chain")
		await createGame(interaction, buttonDuration, "TR")
	}
}
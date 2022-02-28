const { SlashCommandBuilder } = require('@discordjs/builders');
const startWordChainGame = require("./Functions/startWordChainGame");

module.exports = {

	data: new SlashCommandBuilder()
		.setName('başlat')
		.setDescription('Bu kanalda bir oyun başlatır.')
		.addSubcommand(subcommand =>
			subcommand.setName('kelime_zinciri')
				.setDescription('"Kelime Zinciri" oyununu başlatır')
				.addStringOption(option =>
					option.setName('sözlük')
						.setDescription('Referans sözlük seçer')
						.setRequired(true)
						.addChoice('TR', 'TR'))
				.addIntegerOption(option =>
					option.setName('silme_süresi')
						.setDescription('mesajların silinmesi için geçen saniye ("0" bot tepkilerini kapatır, "30" silmeyi kapatır)')
						.setRequired(true))
				.addIntegerOption(option =>
					option.setName('min_kelime_limiti')
						.setDescription('Oyunun bitmesi için gerekli asgari kelime sayısı. (min: 10, max:1000)')
						.setRequired(true)),
		),

	execute: async function (interaction, buttonDuration) {

		if( await interaction.options.getSubcommand() === "kelime_zinciri")
		await startWordChainGame(interaction, buttonDuration, "TR")
	}
}
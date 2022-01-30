const { SlashCommandBuilder } = require('@discordjs/builders');
const createGame = require("./Functions/createGame");

module.exports = {

	data: new SlashCommandBuilder()
		.setName('başlat')
		.setDescription('Bu kanalda bir oyun başlatır.')
		.addStringOption(option =>
			option.setName('sözlük')
				.setDescription('Referans sözlük seçer')
				.setRequired(true)
				.addChoice('TR', 'TR'))
		.addIntegerOption(option =>
			option.setName('min_kelime_limiti')
				.setDescription('Oyunun bitmesi için gerekli minimum kelime sayısı.')
				.setRequired(true)),
	execute: async function (interaction, buttonDuration) {

		await createGame(interaction, buttonDuration, "TR")
	}
}
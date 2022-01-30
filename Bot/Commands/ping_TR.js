const { SlashCommandBuilder } = require('@discordjs/builders');
const ping = require("./Functions/ping");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping_')
		.setDescription('Bağlantının gecikme değerlerini gösterir'),
	async execute(interaction) {

		ping(interaction, "TR")
	},
};

const { SlashCommandBuilder } = require('@discordjs/builders');
const ping = require("./Functions/ping");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping_') // the underscore is to prevent conflict with the command with the same name
		.setDescription('Bağlantının gecikme değerlerini gösterir'),
	async execute(interaction) {

		ping(interaction, "TR")
	},
};

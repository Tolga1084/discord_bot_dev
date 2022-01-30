const { SlashCommandBuilder } = require('@discordjs/builders');
const ping = require("./Functions/ping");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Displays the connection latency'),
	async execute(interaction) {
		ping(interaction, "EN")
	},
};

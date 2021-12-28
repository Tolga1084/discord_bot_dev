const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Ping!'),
	async execute(interaction) {
		interaction.channel.send('Loading data').then (async (msg) =>{
			msg.delete()
			interaction.reply(`🏓  Latency is ${msg.createdTimestamp - interaction.createdTimestamp}ms. API Latency is ${Math.round(interaction.client.ws.ping)}ms`);
		})
	},
};

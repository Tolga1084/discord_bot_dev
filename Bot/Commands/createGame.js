const { MessageActionRow, MessageButton } = require('discord.js');
const { checkChannel, changeChannelState } = require("../Services/channel.service");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { ms } = require("../_helpers/util.js")

//Turkish menu items to be added later:
// 'Komutun verildiği kanalda, oyunu başlatır.
//	Referans sözlük seçer
//	Oyunun sonlanabilmesi için gerekli minimum kelime sayısını belirler. (limitsiz mod için \'0\' değerini girin'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('start')
		.setDescription('Starts the game on the channel this command is called.')
		.addStringOption(option =>
			option.setName('dictionary')
				.setDescription('Selects a dictionary for reference /')
				.setRequired(true)
				.addChoice('TR', 'TR'))
		.addIntegerOption(option =>
			option.setName('min_word_limit')
				.setDescription('Sets the threshold for word-count before the game can end. (enter \'0\' to disable)')
				.setRequired(true)),
	execute: async function (interaction) {

		const channel = await checkChannel(interaction.guildId, interaction.channelId)

		const dict = interaction.options.getString("dictionary")
		const wordLimit = interaction.options.getInteger("min_word_limit")

		const uniqueID = interaction.channelId + interaction.user.id + ms();
		console.log("uniqueID "+uniqueID);
		//if there is already an active game session
		if (channel) {
			if (channel.isActive) {
				const row = new MessageActionRow()
					.addComponents(
						new MessageButton()
							.setCustomId(uniqueID)
							.setLabel('START')
							.setStyle('DANGER'),
					);

				const filter = button => {
					return (button.customId === uniqueID )&&(button.user.id === interaction.user.id) ;
				};

				const collector = interaction.channel.createMessageComponentCollector({
					filter,
					componentType: 'BUTTON',
					time: 30000,
					max: 1
				});

				collector.on('collect', i => {
					console.log("collector user id "+ i.user.id);

					changeChannelState(interaction.guildId, interaction.channelId, interaction.channel.name, true, dict, wordLimit)
					i.reply("the game has started: " + "Dictionary: "+ dict + "; Min word limit: "+ wordLimit)

				});

				collector.on('end', collected => {
					console.log(`Collected ${collected.size} interactions.`)
				});

				await interaction.reply({
					content: `		 ***WARNING***		` +"\nThere is already an active session on this channel!\n" +
						"Starting a new session will terminate it. Press the START button, if you wish to proceed.",
					components: [row]
				})
			}
		}
		else {
			await changeChannelState(interaction.guildId, interaction.channelId, interaction.channel.name, true, dict, wordLimit)
			await interaction.reply("the game has started: " + "Dictionary: "+ dict + "; Min word limit: "+ wordLimit)
		}
	},
};

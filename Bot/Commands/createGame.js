const { MessageActionRow, MessageButton } = require('discord.js');
const { checkChannel } = require("../Services/channel.service");
const { SlashCommandBuilder } = require('@discordjs/builders');

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
				.addChoice('Turkish', 'TR'))
		.addIntegerOption(option =>
			option.setName('min_word_limit')
				.setDescription('Sets the threshold for word-count before the game can end. (enter \'0\' to disable)')
				.setRequired(true)),
	async execute(interaction) {

		const channel = await checkChannel(interaction.guildId, interaction.channelId)

		const dict = interaction.options.getString("dictionary")
		const winLimit = interaction.options.getInteger("min_word_limit")


		//if there is already an active game session
		if(channel.isActive){
			const row = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId('startAnyway')
						.setLabel('START')
						.setStyle('DANGER'),
				);

			const filter = interaction => {
				return (interaction.custom_id === 'startAnyway');
			};

			const collector = interaction.createMessageComponentCollector({ filter, componentType: 'BUTTON', time: 60000, max: 1 });

			collector.on('collect', i => {
				if (i.user.id === interaction.user.id) {
					i.reply(`${i.user.id} clicked on the ${i.customId} button.`);
				} else {
					i.reply({ content: `These buttons aren't for you!`, ephemeral: true });
				}
			});

			await interaction.reply({ content: `***WARNING*** There is already an active session on this channel!
											 	Starting a new session will terminate it. Press the "START" button, if you wish to proceed.`,
								  components: [row],
								  ephemeral: true })
			
		}
	},
};

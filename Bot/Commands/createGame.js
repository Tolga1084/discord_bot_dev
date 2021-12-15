const { getConfirmationButton } = require("./Buttons/ConfirmationButton");
const { getChannel, changeChannelState, registerActiveChannel } = require("../Services/channel.service");
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
				.addChoice('TR', 'TR'))
		.addIntegerOption(option =>
			option.setName('min_word_limit')
				.setDescription('Sets the threshold for the valid answer count before the game can end. (enter \'0\' to disable)')
				.setRequired(true)),
	execute: async function (interaction, buttonDuration) {

		const channel = await getChannel(interaction.channelId)
		const dict = interaction.options.getString("dictionary")
		const wordLimit = interaction.options.getInteger("min_word_limit")
		const update = "the game has started: " + "Dictionary: " + dict + ", Min word limit: " + wordLimit;

		//if there is already an active game session
		if (channel) {
			if (channel.isActive) {
				const collectorFunction = function () {
					return changeChannelState(interaction.channelId, true, dict, wordLimit)
				}
				const row = await getConfirmationButton(interaction, "START", "DANGER", buttonDuration, collectorFunction, update)

				await interaction.reply({
					content: `		 ***WARNING***		` + "\nThere is already an active session on this channel!\n" +
						"Starting a new session will terminate it. Press the START button, if you wish to proceed.",
					components: [row]
				})
			}else {
				await changeChannelState(interaction.channelId, true, dict, wordLimit);
				await interaction.reply(update);
			}
		}else {
			await registerActiveChannel(interaction.guildId, interaction.channelId, interaction.channel.name, true, dict, wordLimit);
			await interaction.reply(update);
		}
	}
}


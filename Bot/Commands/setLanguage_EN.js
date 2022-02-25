const { SlashCommandBuilder } = require('@discordjs/builders');
const {setLanguage} = require("./Functions/setLanguage");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set')
        .setDescription('Changes settings')
        .addStringOption(option =>
            option.setName('language')
                .setDescription('Selects interface language (including commands!)')
                .setRequired(true)
                .addChoice('Turkish', 'TR')
                .addChoice('English', 'EN')),
    async execute(interaction) {
        await setLanguage(interaction, "EN")
    },
};


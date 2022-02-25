const { SlashCommandBuilder } = require('@discordjs/builders');
const {setLanguage} = require("./Functions/setLanguage");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ayarlar')
        .setDescription('Ayarları değiştirir')
        .addStringOption(option =>
            option.setName('dil')
                .setDescription('Arayüz dilini ayarlar (komutlar dahil!)')
                .setRequired(true)
                .addChoice('Turkish', 'TR')
                .addChoice('English', 'EN')),
    async execute(interaction) {
        await setLanguage(interaction, "TR")
    },
};


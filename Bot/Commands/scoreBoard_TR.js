const { SlashCommandBuilder } = require('@discordjs/builders');
const scoreBoard = require("./Functions/scoreBoard");
const {gameEnum } = require("../Services/channel.service.js");

module.exports = {

    data: new SlashCommandBuilder()
        .setName('skor')
        .setDescription('Bir oyuna ait skor tabelasını gösterir (sunucu çapında) //')
            .addStringOption(option =>
                option.setName('oyun')
                    .setDescription('Skor durumunu göstermek istediğiniz oyunu seçer')
                    .setRequired(true)
                    .addChoice('kelime_zinciri', 'Kelime Zinciri')),

    execute: async function (interaction, buttonDuration) {

            await scoreBoard(interaction, "TR", interaction.options.getString("oyun"))
    }
}
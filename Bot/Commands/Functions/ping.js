
async function ping (interaction, language) {
    const languages = {
        TR: {
            loading: "Veri yükleniyor"
        },

        EN: {
            loading: "Loading data"
        }
    }
    const L = languages[language.toUpperCase()];

    interaction.channel.send(L.loading).then (async (msg) =>{

        languages.TR.reply = `🏓  Gecikme ${msg.createdTimestamp - interaction.createdTimestamp}ms. API gecikmesi ${Math.round(interaction.client.ws.ping)}ms`;
        languages.EN.reply = `🏓  Latency is ${msg.createdTimestamp - interaction.createdTimestamp}ms. API Latency is ${Math.round(interaction.client.ws.ping)}ms`;

        msg.delete()
        interaction.reply(L.reply);
    })
}

module.exports = ping
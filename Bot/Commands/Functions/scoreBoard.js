const getEmojis  = require("../../_helpers/getEmojis");
const {getScoreboard} = require("../../Services/Games/wordChain.service");
const {replyThenDelete} = require("../../_helpers/util");
const { Formatters } = require('discord.js');

async function scoreBoard (interaction, language, game) {

    await interaction.deferReply()

    const emojis = await getEmojis(interaction.client)
    const languages = {
        TR: {
            scoreBoard: "Skor Tablosu",
            score: "Skor",
            noRecord: "Hiç puanın yok! " + `${emojis.altar}`,
            noPlayers: "Daha puan alabilen olmamış! " +`${emojis.ever}`,
            failure: "Bir şeyler yanlış gitti! " + `${emojis.HC_Fine}`

        },
        EN: {
            scoreBoard: "Skor Tablosu",
            score: "Score",
            noRecord: "You have no score! " + `${emojis.altar}`,
            noPlayers: "Nobody has scored yet! " +`${emojis.ever}`,
            failure: "Something went wrong! " + `${emojis.HC_Fine}`
        }
    }

    const L = languages[language.toUpperCase()];

    const guildIcon = await interaction.guild.iconURL()

    const embed = {
        "title": "title",
            "color": 5763719,
            "thumbnail": {
            "url": guildIcon
        },
        "fields": [
            {
                "name": L.scoreBoard,
                "value": "",
            }
        ]
    }
    embed.title = game.toLocaleUpperCase(language)

    try {
        const { players, scores, playerTrio, noPlayers } = await getScoreboard(interaction.guildId, interaction)

        if(noPlayers){
            replyThenDelete(interaction,L.noPlayers)
            return
        }

        let isAuthorIncluded = false
        embed.fields[0].value +=  players.map((player,index) => {
            if (player.id === interaction.member.id){
                isAuthorIncluded = true
                return ( "***" + (index + 1) + ". " + Formatters.userMention(player.id) + "***\n" + `${emojis.redArrow} ` + Formatters.bold(scores[index]))
            }
            return ((index + 1) + ". " + Formatters.userMention(player.id) + "\n" + `${emojis.greenArrow} ` + Formatters.bold(scores[index]))
        }).join("\n\n")

        if (!isAuthorIncluded && playerTrio.player){ //player may not exist since the interaction author may not have been registered.
            embed.fields[0].value += "\n..."

            if ((playerTrio.player.rank !== 11)){
                embed.fields[0].value += "\n\n" + playerTrio.playerNext.rank+ ". " + Formatters.userMention(playerTrio.playerNext.id)
                embed.fields[0].value += "\n" + `${emojis.greenArrow} ` + playerTrio.playerNext.score
            }

            embed.fields[0].value += "\n\n" + "***" + playerTrio.player.rank+ ". " + Formatters.userMention(playerTrio.player.id) + "***"
            embed.fields[0].value += "\n" + `${emojis.redArrow} ` + playerTrio.player.score

            if(playerTrio.playerPrev) {
                embed.fields[0].value += "\n\n" + playerTrio.playerPrev.rank + ". " + Formatters.userMention(playerTrio.playerPrev.id)
                embed.fields[0].value += "\n" + `${emojis.greenArrow} ` + playerTrio.playerPrev.score
            }
        }

        if(!isAuthorIncluded && playerTrio.player === undefined) interaction.followUp(L.noRecord)

        interaction.followUp({
            embeds: [embed]
        })
    } catch (err) {
        console.log(err)
        replyThenDelete(interaction, L.failure, true, 5000)
    }
}

module.exports = scoreBoard
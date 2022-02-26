// user, channel and command specific cooldown
// TODO calm down meme
function cooldown (interaction, commandName, set, cooldown, language) {
    const id = (interaction.user.id + commandName + interaction.channelId)

    const languages = {
        TR: {
            warning: "Bu komutu, bu kanalda, daha az önce kullandın! (bekleme periyodu: " + cooldown/1000 + " saniye)"
        },

        EN: {
            warning: "You have already used this command recently on this channel! (cooldown period: " + cooldown/1000 + " seconds)"
        }
    }

    const L = languages[language.toUpperCase()];

    if (set.has(id)) {
        interaction.reply(L.warning);
        setTimeout(() => interaction.deleteReply() , 5000 )
        return true
    } else {
        set.add(id);
        setTimeout(() => {set.delete(id)}, cooldown);
        return false
    }
}

module.exports = { cooldown }
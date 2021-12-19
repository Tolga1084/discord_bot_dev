// user, channel and command specific cooldown

function cooldown (interaction, commandName, set, cooldown) {
    const id = (interaction.user.id + commandName + interaction.channelId)
    console.log(id)

    if (set.has(id)) {
        interaction.reply("You have already used this command recently on this channel! (cooldown period: " + cooldown/1000 + " seconds)");
        setTimeout(() => interaction.deleteReply() , 5000 )
        console.log("cooldown true")
        return true
    } else {
        set.add(id);
        setTimeout(() => {set.delete(id)}, cooldown);
        console.log("cooldown false")
        return false
    }
}

module.exports = { cooldown }
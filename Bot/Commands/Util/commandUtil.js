function cooldown (interaction, set, cooldown) {
    if (set.has(interaction.user.id)) {
        interaction.reply("You have already used this command recently!");
        return true
    } else {
        set.add(interaction.user.id);
        setTimeout(() => {
            set.delete(interaction.user.id);
        }, cooldown);
        return false
    }
}

module.exports = { cooldown }
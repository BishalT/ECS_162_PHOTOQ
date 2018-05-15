exports.run = (bot, message, args) => {
    message.channel.send({
        embed: {
            color: 3447003,
            author: {
                name: bot.user.username,
                icon_url: bot.user.avatarURL
            },
            title: "List of Commands:",
            description: "This is a list of commands that you can use right now:",
            fields: [{
                name: "commands",
                value: "List all the commands like you just did now. Kappa"
            },
            {
                name: "refresh",
                value: "How to use: !refresh <command name>. Refreshes the command based on changes."
            },
            {
                name: "profile",
                value: "How to use: !profile <name>. Bot responds what they think of the person."
            },
            {
                name: "More inc...",
                value: "Just a **__placeholder__** for later..."
            }
            ],
            timestamp: new Date(),
        }
    });
}
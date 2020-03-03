const Discord = require("discord.js");
const bot = new Discord.Client();

const config = require("./botconfig.json");

bot.on("ready", () => {
  console.log(
    `Bot has started, with ${bot.users.size} users, in ${bot.channels.size} channels of ${bot.guilds.size} guilds.`
  );
  bot.user.setActivity("Keeping an eye on things");
});

bot.on("guildCreate", guild => {
  console.log(
    `New server joined: ${guild.name} (id: ${guild.id}). This server has ${guild.memberCount} members!`
  );
  bot.user.setActivity(`Serving ${bot.guilds.size} servers`);
});

bot.on("guildDelete", guild => {
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  bot.user.setActivity(`Serving ${bot.guilds.size} servers`);
});

bot.on("message", async message => {
  // Ignore other bots
  if (message.author.bot) return;

  // Also good practice to ignore any message that does not start with our prefix,
  // which is set in the configuration file.
  if (message.content.indexOf(config.prefix) !== 0) return;

  // split command e.g. args = ["Is", "this", "the", "real", "life"]
  const args = message.content
    .slice(config.prefix.length)
    .trim()
    .split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === "ban") {
    if (!message.member.roles.some(r => ["Administrator", "Admin"].includes(r.name))) {
      console.log(message.author + " tried to ban " + message.mentions.members.first());
      return message.reply(
        "You do not have permission to ban. This incident will be recorded."
      );
    }


    let member = message.mentions.members.first();
    if (!member)
      return message.reply("Invalid member of server.");
    if (!member.bannable)
      return message.reply(
        "You cannot ban a superior. This incident will be recorded."
      );

    let reason = args.slice(1).join(" ");
    if (!reason) reason = "No reason provided";

    await member
      .ban(reason)
      .catch(error =>
        message.reply(
          `Sorry ${message.author} I couldn't ban because of : ${error}`
        )
      );
    message.reply(
      `${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`
    );
  }

  if (command === "purge") {
    // This command removes all messages from all users in the channel, up to 100.

    // get the delete count, as an actual number.
    const deleteCount = parseInt(args[0], 10);

    // Ooooh nice, combined conditions. <3
    if (!deleteCount || deleteCount < 2 || deleteCount > 100)
      return message.reply(
        "Please provide a number between 2 and 100 for the number of messages to delete"
      );

    // So we get our messages, and delete them. Simple enough, right?
    const fetched = await message.channel.fetchMessages({
      limit: deleteCount
    });
    message.channel
      .bulkDelete(fetched)
      .catch(error =>
        message.reply(`Couldn't delete messages because of: ${error}`)
      );
  }
});

bot.login(config.token);
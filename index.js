const Discord = require("discord.js");
const bot = new Discord.Client();
const fs = require("fs");
const path = "./botconfig.json";

let token;
const prefix = "raven ";
try {
  if (fs.existsSync(path)) {
    const config = require("./botconfig.json");
    token = config.token;
  } else {
    token = process.env.TOKEN;
  }
} catch (err) { }

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

  // Also good practice to ignore any message that does not start with our
  // prefix, which is set in the configuration file.
  if (message.content.toLowerCase().indexOf(prefix) !== 0) return;

  // split command e.g. args = ["Is", "this", "the", "real", "life"]
  const args = message.content
    .slice(prefix.length)
    .trim()
    .split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === "ban") {
    return ban(args, message);
  }

  if (command === "purge") {
    return purge(args, message);
  }

  if (command === "say") {
    say(args, message);
  }
});

async function ban(args) {
  console.log(
    message.author.tag +
    " tried to ban " +
    message.mentions.members.first().nickname
  );
  if (
    !message.member.roles.some(r => ["Administrator", "Admin"].includes(r.name))
  ) {
    return message.reply(
      "You do not have permission to ban. This incident will be recorded."
    );
  }

  let member = message.mentions.members.first();
  if (!member) return message.reply("Invalid member of server.");
  if (!member.bannable)
    return message.reply(
      "You cannot ban a superior. This incident will be recorded."
    );

  let reason = args.slice(1).join(" ");
  if (!reason) reason = "No reason provided.";

  await member
    .ban(reason)
    .catch(error =>
      message.reply(`${message.author} I couldn't ban because: ${error}`)
    );
  message.reply(
    `${member.user.tag} has been banned by ${message.author.tag} because ${reason}`
  );
}

async function purge(args, message) {
  const deleteCount = parseInt(args[0], 10);

  if (!message.member.roles.some(r => ["Administrator", "Admin"].includes(r.name))) {
    return message.reply("You do not have permission to purge.");
  }

  if (!deleteCount || deleteCount < 2 || deleteCount > 100)
    return message.reply(
      "Please provide a number between 2 and 100 for the number of messages to delete"
    );

  const fetched = await message.channel.fetchMessages({ limit: deleteCount });
  message.channel
    .bulkDelete(fetched)
    .catch(error =>
      message.reply(`Couldn't delete messages because of: ${error}`)
    );
}

function say(args, message) {
  let msg = args.join(' ');
  message.channel.send(msg);
}

bot.login(token);

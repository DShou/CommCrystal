
// import the discord.js module
const Discord = require("discord.js");
// Import fs module
const fs = require("fs");
// create an instance of a Discord Client - called client
const client = new Discord.Client();
// SGQlite Database
const sql = require('sqlite');
sql.open('./stats.sqlite');

// Load Data Files
const cred = require('./credentials.json');
const config = require('./config.json');

// Log-in Info
client.login(cred.token);

// ---------------------------------------------------------------------------
// Ready Up
// ---------------------------------------------------------------------------

// Bot Start Up - This will always occur first before anything else
client.on('ready', () => {
  console.log(`Username ${client.user.username}. User ID ${client.user.id}.`);
  console.log(`Ready to server in ${client.channels.size} channels on ${client.guilds.size} servers, for a total of ${client.users.size} users.`);
});

// ---------------------------------------------------------------------------
// Auto Messages
// ---------------------------------------------------------------------------

// Member Joins Server
client.on("guildMemberAdd", (member) => {
  console.log(`User "${member.user.username}" has joined "${member.guild.name}".` );
});

// Member Leaves Server
client.on("guildMemberRemove", (member) => {
  console.log(`User "${member.user.username}" has left "${member.guild.name}".` );
});

// ---------------------------------------------------------------------------
// Pre-emptive Check for Messages
// ---------------------------------------------------------------------------

client.on('message', (msg) => {

// Prevent Infinite Bot Loop - Ignore Bots
  if (msg.author.bot) return;

// Record User Stats
  if (msg.channel.type === 'text') {
  sql.get(`SELECT * FROM stats WHERE userId ='${msg.author.id}'`).then(row => {
    if (!row) {
      sql.run('INSERT INTO stats (userId, messageCount, mana) VALUES (?, ?, ?)', [msg.author.id, 1, 0]);
      }
    sql.run(`UPDATE stats SET messageCount = ${row.messageCount + 1} WHERE userId = ${msg.author.id}`);
    }
  ).catch(() => {
    console.error;
    sql.run('CREATE TABLE IF NOT EXISTS stats (userId TEXT, messageCount INTEGER, mana INTEGER)').then(() => {
      sql.run('INSERT INTO stats (userId, messageCount, mana) VALUES (?, ?, ?)', [msg.author.id, 1, 0]);
    });
  });
  }

// If no Prefix, Ignore Message
  if (!msg.content.startsWith(config.prefix)) return;

// ---------------------------------------------------------------------------
// Basic Commands
// ---------------------------------------------------------------------------

// Response Messages
  if (msg.content.startsWith(config.prefix + 'help')) {
    msg.channel.sendMessage('**NOTE:** Link Preview must be turned on in settings to view most of ' + client.user.username + '\'s messages.');
    const embed = new Discord.RichEmbed()
    .setColor(5263440)
    .setAuthor('Commands', client.user.avatarURL)
    .setDescription(config.prefix + 'stats - View your personal Stat Card\n' +
                    config.prefix + 'about - View info about the Bot and Author\n' +
                    config.prefix + 'channel - View info about the Channel')
    msg.channel.sendEmbed(embed);
  }

  if (msg.content.startsWith(config.prefix + 'about')) {
    const embed = new Discord.RichEmbed()
    .setColor(5263440)
    .setAuthor('About ' + client.user.username, client.user.avatarURL)
    .setDescription('This bot was created by DShou for his own entertainment, as well as a utility bot for his servers.')
    msg.channel.sendEmbed(embed);
  }

  if (msg.content.startsWith(config.prefix + 'channel')) {
    const embed = new Discord.RichEmbed()
    .setColor(5263440)
    .setAuthor('About ' + msg.channel.name, client.user.avatarURL)
    .setDescription('**Channel Type:** ' + msg.channel.type +
                    '\n**Channel ID:** ' + msg.channel.id +
                    '\n**Creation Time:** ' + msg.channel.createdAt)
    msg.channel.sendEmbed(embed);
  }

// Check Stats
  if (msg.content.startsWith(config.prefix + "stats")) {
    sql.get(`SELECT * FROM stats WHERE userId ='${msg.author.id}'`).then(row => {
      const embed = new Discord.RichEmbed()
      .setColor(3447003)
      .setAuthor(msg.author.username, msg.author.avatarURL)
      .setTitle('__Stats Card__')
      .addField('**Message Count**', `${row.messageCount}`)
      .addField('**Mana Points**', `${row.mana}`);
      msg.channel.sendEmbed(embed);
      }
    ).catch(() => {
      console.error;
      sql.run('CREATE TABLE IF NOT EXISTS stats (userId TEXT, messageCount INTEGER, mana INTEGER)').then(() => {
        sql.run('INSERT INTO stats (userId, messageCount, mana) VALUES (?, ?, ?)', [msg.author.id, 1, 0]);
      });
    });
  }

// ---------------------------------------------------------------------------
// Admin Commands
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// Owner Commands
// ---------------------------------------------------------------------------

// Owner-Only after this Point
  if (msg.author.id !== cred.ownerID) return;

// Change Online Status
  if (msg.content.startsWith(config.prefix + 'online')) {
    client.user.setGame(msg.content.substr('10'));
    msg.channel.sendMessage('Status changed to: ' + msg.content.substr('10'));
    console.log(`Status changed to: ` + msg.content.substr('10'));
  }

// Change Game Status - note, substr value 10 based on 3 character prefix.
  if (msg.content.startsWith(config.prefix + 'status')) {
    client.user.setGame(msg.content.substr('10'));
    msg.channel.sendMessage('Status changed to: ' + msg.content.substr('10'));
    console.log(`Status changed to: ` + msg.content.substr('10'));
  }

// BIG RED BUTTON
  if (msg.content.startsWith(config.prefix + 'stop') || msg.content.startsWith(config.prefix + 'quit')) {
      msg.channel.sendMessage('Shutdown confirmed.');
      console.log(`SHUTDOWN COMMAND ENACTED`);
      client.destroy();
  }

});

// ---------------------------------------------------------------------------
// Error Messages
// ---------------------------------------------------------------------------

client.on('error', (e) => console.error(e));
client.on('warn', (e) => console.warn(e));
client.on('debug', (e) => console.info(e));

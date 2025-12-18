require('dotenv').config();
const { Client, GatewayIntentBits, Events } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

// load modules
require('./verify')(client);
require('./selfrole')(client);

client.once(Events.ClientReady, () => {
  console.log(`🚀 Bot online sebagai ${client.user.tag}`);
});

client.login(process.env.TOKEN);

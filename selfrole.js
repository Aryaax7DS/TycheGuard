const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
  EmbedBuilder
} = require('discord.js');

const {
  SELF_ROLE_CHANNEL_ID,
  SELF_ROLES
} = require('./config');

module.exports = (client) => {

  // === KIRIM PESAN SELF ROLE SAAT BOT READY ===
  client.once(Events.ClientReady, async () => {
    const channel = await client.channels.fetch(SELF_ROLE_CHANNEL_ID);
    const messages = await channel.messages.fetch({ limit: 5 });
    if (messages.some(m => m.author.id === client.user.id)) return;

    const embed = new EmbedBuilder()
      .setColor('#9b59b6')
      .setTitle('🎮 PILIH ROLE KAMU')
      .setDescription(
        `Klik tombol sesuai game / minat kamu.\n\n` +
        `✨ Bisa pilih lebih dari satu role\n` +
        `🔁 Klik lagi untuk remove role\n\n` +
        `Role ini cuma buat identitas & matchmaking 😎`
      )
      .setImage('https://media.tenor.com/Iy9Y2k4UO7MAAAAC/anime-party.gif');

    const row = new ActionRowBuilder().addComponents(
      Object.entries(SELF_ROLES).map(([key, data]) =>
        new ButtonBuilder()
          .setCustomId(`selfrole_${key}`)
          .setLabel(data.label)
          .setStyle(ButtonStyle.Secondary)
          .setEmoji(data.emoji)
      )
    );

    await channel.send({ embeds: [embed], components: [row] });
  });

  // === HANDLE BUTTON SELF ROLE ===
  client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('selfrole_')) return;

    const key = interaction.customId.replace('selfrole_', '');
    const roleData = SELF_ROLES[key];
    if (!roleData) return;

    const member = await interaction.guild.members.fetch(interaction.user.id);
    const role = interaction.guild.roles.cache.get(roleData.roleId);

    if (member.roles.cache.has(role.id)) {
      await member.roles.remove(role.id);
      return interaction.reply({
        content: `➖ Role **${role.name}** dihapus.`,
        ephemeral: true
      });
    } else {
      await member.roles.add(role.id);
      return interaction.reply({
        content: `➕ Role **${role.name}** ditambahkan!`,
        ephemeral: true
      });
    }
  });
};

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
  EmbedBuilder
} = require('discord.js');

const {
  VERIFIED_ROLE_ID,
  UNVERIFIED_ROLE_ID,
  VERIFY_CHANNEL_ID,
  VERIFY_LOG_CHANNEL_ID,
  MIN_ACCOUNT_AGE_DAYS
} = require('./config');

module.exports = (client) => {

  // ================= READY =================
  client.once(Events.ClientReady, async () => {
    console.log('✅ Verify system loaded');

    const channel = await client.channels.fetch(VERIFY_CHANNEL_ID);
    const messages = await channel.messages.fetch({ limit: 10 });
    if (messages.some(m => m.author.id === client.user.id)) return;

    const buttonRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('verify')
        .setLabel('🚀 VERIFY & ENTER THE SERVER')
        .setStyle(ButtonStyle.Success)
    );

    const mainEmbed = new EmbedBuilder()
      .setColor('#00bfff')
      .setAuthor({
        name: 'Tyche Community Security System',
        iconURL: client.user.displayAvatarURL()
      })
      .setTitle('🎉 SELAMAT DATANG DI TYCHE COMMUNITY 🎉')
      .setDescription(
        `🔥 **Tempat nongkrong, mabar, diskusi, dan chaos positif** 🔥\n\n` +
        `Sebelum kamu bebas menjelajahi seluruh server,\n` +
        `kami perlu memastikan satu hal penting:\n\n` +
        `👉 **Kamu adalah manusia asli, bukan bot / spam** 🤖❌`
      )
      .setImage('https://media.giphy.com/media/qb1eHxhUHLdsc/giphy.gif');

    const guideEmbed = new EmbedBuilder()
      .setColor('#00ff9c')
      .setTitle('🔐 PROSES VERIFIKASI')
      .setDescription(
        `✨ **Langkah Mudah:**\n` +
        `1️⃣ Klik tombol **VERIFY & ENTER THE SERVER**\n` +
        `2️⃣ Sistem akan melakukan pemindaian akun\n` +
        `3️⃣ Jika lolos → akses FULL terbuka 🎊\n\n` +
        `📌 **Syarat Keamanan:**\n` +
        `Akun Discord minimal **${MIN_ACCOUNT_AGE_DAYS} hari**`
      )
      .setThumbnail(channel.guild.iconURL({ dynamic: true }));

    await channel.send({
      embeds: [mainEmbed, guideEmbed],
      components: [buttonRow]
    });
  });

  // ================= INTERACTION =================
  client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton() || interaction.customId !== 'verify') return;

    await interaction.deferReply({ ephemeral: true });

    const loadingEmbed = new EmbedBuilder()
      .setColor('#ffaa00')
      .setTitle('🔍 Scanning Your Account...')
      .setDescription(
        `Mohon tunggu sebentar 👀\n\n` +
        `🛡️ Checking account age...\n` +
        `🧠 Verifying member status...\n` +
        `🔒 Securing the server...\n\n` +
        `⏳ Estimasi waktu: **3 detik**`
      )
      .setImage('https://media.tenor.com/2roX3uxz_68AAAAC/loading-anime.gif');

    await interaction.editReply({ embeds: [loadingEmbed] });

    setTimeout(async () => {
      try {
        const member = await interaction.guild.members.fetch(interaction.user.id);
        const accountAgeDays =
          (Date.now() - interaction.user.createdTimestamp) /
          (1000 * 60 * 60 * 24);

      // ===== ALREADY VERIFIED =====
      if (member.roles.cache.has(VERIFIED_ROLE_ID)) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#00ff9c')
              .setTitle('😎 Kamu Udah Verified!')
              .setDescription(
                `Tenang bro/sis~\n\n` +
                `Akun kamu sudah aman & terverifikasi.\n` +
                `Langsung nikmati semua fitur server 🚀🔥`
              )
              .setImage('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmRicGRlYnNrNXI5djdvaWR3b3c5NXQ1ZjdmZXBtNmoweDFuZXU0ayZlcD12MV9naWZzX3NlYXJjaCZjdD1n/QCJlIDkOJDEIctfdzz/giphy.gif')
          ]
        });
      }

      // ===== FAILED =====
      if (accountAgeDays < MIN_ACCOUNT_AGE_DAYS) {
        const failEmbed = new EmbedBuilder()
          .setColor('#ff4d4d')
          .setTitle('❌ VERIFIKASI DITOLAK')
          .setDescription(
            `😢 Akun Discord kamu masih terlalu baru\n\n` +
            `📅 Umur akun: **${accountAgeDays.toFixed(1)} hari**\n` +
            `🔒 Minimal: **${MIN_ACCOUNT_AGE_DAYS} hari**\n\n` +
            `Aturan ini dibuat demi keamanan komunitas 💙`
          )
          .setImage('https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3Ynpyc25mbGIzeWlzN241c3V0NHFlZnR3cDIwamUxdmhzcmhnYnloOSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/q1R1ZiUskINVOn6bz3/giphy.gif');

        await interaction.editReply({ embeds: [failEmbed] });

        await interaction.user.send({
          embeds: [
            new EmbedBuilder()
              .setColor('#ff4d4d')
              .setTitle('💤 BELUM BISA MASUK')
              .setDescription(
                `Halo **${interaction.user.username}** 👋\n\n` +
                `Terima kasih sudah mampir ke **Tyche Community**.\n` +
                `Kami tunggu kamu balik lagi setelah akunmu cukup umur ya ✨`
              )
              .setImage('https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3Ynpyc25mbGIzeWlzN241c3V0NHFlZnR3cDIwamUxdmhzcmhnYnloOSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/KOYptxBqx90uW8Z88r/giphy.gif')
          ]
        }).catch(() => {});

        return;
      }

      // ===== SUCCESS =====
      await member.roles.add(VERIFIED_ROLE_ID);
      await member.roles.remove(UNVERIFIED_ROLE_ID);

      const successEmbed = new EmbedBuilder()
        .setColor('#00ff9c')
        .setTitle('🎉 VERIFICATION SUCCESS 🎉')
        .setDescription(
          `🔥 **WELCOME ${interaction.user.username}!** 🔥\n\n` +
          `Kamu resmi menjadi bagian dari **Tyche Community**.\n\n` +
          `🎮 Mabar\n💬 Ngobrol\n🎉 Event\n\n` +
          `Saatnya bikin momen seru bareng 😎🔥`
        )
        .setImage('https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3Ynpyc25mbGIzeWlzN241c3V0NHFlZnR3cDIwamUxdmhzcmhnYnloOSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/q217GUnfKAmJlFcjBX/giphy.gif');

      await interaction.editReply({ embeds: [successEmbed] });

      await interaction.user.send({
        embeds: [
          new EmbedBuilder()
            .setColor('#00ff9c')
            .setTitle('🎊 WELCOME PARTY 🎊')
            .setDescription(
              `Akses **FULL SERVER** sudah terbuka!\n\n` +
              `✨ Jangan lupa baca rules\n` +
              `✨ Jaga vibes positif\n` +
              `✨ Have fun & enjoy!`
            )
            .setImage('https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3Z3gwaGdrcTc4Y3B0N2lsd3RjYWg5MnpwaTAzOHBmZnZ0YmZwMHh1NyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/lsUWq3SQ3NLYusKJ4O/giphy.gif')
        ]
      }).catch(() => {});

const logChannel = await client.channels.fetch(VERIFY_LOG_CHANNEL_ID);

const now = Math.floor(Date.now() / 1000); // timestamp Discord

await logChannel.send({
  embeds: [
    new EmbedBuilder()
      .setColor('#00bfff')
      .setAuthor({
        name: 'Tyche Verification System',
        iconURL: client.user.displayAvatarURL()
      })
      .setTitle('🟢 USER VERIFIED SUCCESSFULLY')
      .setDescription(
        `Sebuah akun baru berhasil melewati sistem verifikasi.\n` +
        `Semua pengecekan telah **lulus** ✅`
      )
      .addFields(
        {
          name: '👤 User',
          value: `${interaction.user.tag}\n\`${interaction.user.id}\``,
          inline: true
        },
        {
          name: '📆 Account Age',
          value: `${accountAgeDays.toFixed(1)} hari`,
          inline: true
        },
        {
          name: '⏰ Verified At',
          value: `<t:${now}:F>\n(<t:${now}:R>)`,
          inline: false
        }
      )
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .setFooter({
        text: 'Tyche Community • Verification Log'
      })
      .setTimestamp()
  ]
});

    } catch (err) {
      console.error(err);
      await interaction.editReply({
        content: '⚠️ Terjadi error saat verifikasi. Hubungi staff.'
      });
    }
  }, 3000); // ⏱️ FAKE LOADING 3 DETIK
});

};

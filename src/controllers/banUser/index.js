const Scene = require("telegraf/scenes/base");

const User = require("../../models/User");

const banUser = new Scene("ban_user");

banUser.enter(async (ctx) => {
  return ctx.replyWithMarkdown(`❗️ Вы получили бан!`);
});

banUser.use(async (ctx) => {
  const userDB = await User.findOne({ telegramId: ctx.from.id });
  if (!userDB.isBanned) return ctx.scene.enter(`main_menu`);

  return ctx.replyWithMarkdown(`❗️ Вы получили бан!`);
});

module.exports = banUser;

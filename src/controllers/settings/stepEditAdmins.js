const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");

const { getItemList, getNumbersIK } = require("../../helpers");
const { typesQuery } = require("../../constants");

const User = require("../../models/User");

const moreBtns = [
  Markup.callbackButton(
    "Принять",
    JSON.stringify({
      type: typesQuery.ACCEPT,
    })
  ),
];

const getAdminNamesStr = (adminsDB) => {
  const adminNamesStr = adminsDB.length
    ? getItemList(
        adminsDB.map((admin) =>
          [admin.firstName, admin.lastName].filter((v) => v).join(" ")
        )
      )
    : "Добавленных админов нет.";

  return `👥 *Админы* \n\n${adminNamesStr} \n\nПерешлите любое сообщение реплаем от пользователя телеграм, которого хотите сделать админом. Чтобы *удалить* админа, выберите кнопку с его порядковым номером.`;
};

const stepEditAdmins = new Scene("step_edit_admins");

stepEditAdmins.enter(async (ctx) => {
  const adminsDB = await User.find({}, "firstName lastName telegramId");
  const adminNamesStr = getAdminNamesStr(adminsDB);
  const ik = getNumbersIK(adminsDB, typesQuery.DELETE_ADMIN, moreBtns);

  const message = await ctx.replyWithMarkdown(adminNamesStr, ik);
  ctx.session.editAdminMessageId = message.message_id;
});

stepEditAdmins.leave(async (ctx) => {
  await ctx.telegram.editMessageReplyMarkup(
    ctx.chat.id,
    ctx.session.editAdminMessageId
  );
  delete ctx.session.editAdminMessageId;
});

stepEditAdmins.start(async (ctx) => {
  await ctx.scene.enter("main_menu");
});

stepEditAdmins.on("text", async (ctx) => {
  await ctx.deleteMessage();

  if (ctx.message.forward_sender_name)
    return ctx.replyWithMarkdown(
      "❗️ Невозможно сделать админом. У данного пользователя анонимный профиль!"
    );
  if (!ctx.message.forward_from) return;
  if (ctx.message.forward_from.is_bot) return;

  const { editAdminMessageId } = ctx.session;
  const { id, first_name, last_name } = ctx.message.forward_from;

  await User.create({
    created: new Date(),
    telegramId: id,
    firstName: first_name,
    lastName: last_name,
  });

  const adminsDB = await User.find({}, "firstName lastName telegramId");
  const adminNamesStr = getAdminNamesStr(adminsDB);
  const ik = getNumbersIK(adminsDB, typesQuery.DELETE_ADMIN, moreBtns);

  return ctx.telegram.editMessageText(
    ctx.chat.id,
    editAdminMessageId,
    null,
    adminNamesStr,
    ik
  );
});

stepEditAdmins.on("callback_query", async (ctx) => {
  const { type, index } = JSON.parse(ctx.callbackQuery.data);

  switch (type) {
    case typesQuery.DELETE_ADMIN:
      const userDB = await User.findOne({ telegramId: index });

      if (userDB.isMainAdmin) return ctx.answerCbQuery("Владельца не удалить!");

      await userDB.remove();

      const adminsDB = await User.find({}, "firstName lastName telegramId");
      const adminNamesStr = getAdminNamesStr(adminsDB);
      const ik = getNumbersIK(adminsDB, typesQuery.DELETE_ADMIN, moreBtns);

      await ctx.answerCbQuery();
      return ctx.editMessageText(adminNamesStr, ik);

    case typesQuery.ACCEPT:
      await ctx.answerCbQuery();
      return ctx.scene.enter("settings");

    default:
      await ctx.replyWithMarkdown(`❗️ Используйте кнопки в меню _Админы_.`);
      return ctx.answerCbQuery();
  }
});

stepEditAdmins.use(async (ctx) =>
  ctx.replyWithMarkdown(
    `❗️ Перешлите любое сообщение реплаем от пользователя телеграм, которого хотите сделать админом!`
  )
);

module.exports = stepEditAdmins;

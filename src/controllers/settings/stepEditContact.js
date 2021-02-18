const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const { typesQuery } = require("../../constants");
const { getContact } = require("../../helpers");

const Options = require("../../models/Options");

const stepEditContact = new Scene("step_edit_contact");

stepEditContact.start(async (ctx) => {
  await ctx.scene.enter("main_menu");
});

stepEditContact.enter(async (ctx) => {
  const optionsDB = await Options.findOne({}, "contact");

  const { name, email, phones } = getContact(optionsDB.contact);

  await ctx.replyWithMarkdown(
    `📒 *Контакты* \n\nНаимнование компании:\n${name} \n\nEMAIL:\n${email} \n\nТЕЛЕФОНЫ:\n${phones}`,
    Markup.inlineKeyboard([
      [
        Markup.callbackButton(
          "Ред. наименование",
          JSON.stringify({ type: typesQuery.EDIT_NAME_COMPANY })
        ),
      ],
      [
        Markup.callbackButton(
          "Ред. email",
          JSON.stringify({ type: typesQuery.EDIT_EMAIL })
        ),
        Markup.callbackButton(
          "Ред. телефон",
          JSON.stringify({ type: typesQuery.EDIT_PHONE })
        ),
      ],
      [
        Markup.callbackButton(
          "⚙️ Настройки",
          JSON.stringify({ type: typesQuery.SETTINGS })
        ),
      ],
    ]).extra()
  );
});

stepEditContact.on("callback_query", async (ctx) => {
  const { type } = JSON.parse(ctx.callbackQuery.data);

  switch (type) {
    case typesQuery.EDIT_NAME_COMPANY:
      await ctx.answerCbQuery();
      return ctx.scene.enter("step_edit_name_company");

    case typesQuery.EDIT_EMAIL:
      await ctx.answerCbQuery();
      return ctx.scene.enter("step_edit_email");

    case typesQuery.EDIT_PHONE:
      await ctx.answerCbQuery();
      return ctx.scene.enter("step_edit_all_phones");

    case typesQuery.ADD_MANAGER:
      await ctx.answerCbQuery();
      return ctx.scene.enter("step_add_manager");

    case typesQuery.SETTINGS:
      await ctx.answerCbQuery();
      return ctx.scene.enter("settings");

    default:
      await ctx.replyWithMarkdown(`❗️ Используйте кнопки в меню _Контакты_.`);
      break;
  }

  await ctx.answerCbQuery();
});

stepEditContact.use(async (ctx) => {
  await ctx.replyWithMarkdown(`❗️ Используйте кнопки в меню _Контакты_.`);
});

module.exports = stepEditContact;

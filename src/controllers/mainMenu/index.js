const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const { typesQuery } = require("../../constants");
const {
  checkJSONmw,
  getAutopostingStatusStr,
  accessMainMenuMW,
} = require("../../helpers");

const ObjectRe = require("../../models/ObjectRe");
const Options = require("../../models/Options");

const checkContact = (options) =>
  options &&
  options.contact.name &&
  options.contact.email &&
  options.contact.phones.length;

const mainMenu = new Scene("main_menu");

mainMenu.start(async (ctx) => {
  await ctx.scene.enter("main_menu");
});

mainMenu.enter(accessMainMenuMW, async (ctx) => {
  delete ctx.session.post;
  delete ctx.session.editObjectRe;

  const optionsDB = (await Options.findOne()) || (await Options.create({}));
  const objectReCount = await ObjectRe.estimatedDocumentCount();
  const activeObjectReCount = await ObjectRe.countDocuments({
    isArchived: false,
  });
  const archiveObjectReCount = await ObjectRe.countDocuments({
    isArchived: true,
  });

  const autopostingStatusStr = getAutopostingStatusStr(
    optionsDB.autopostingStatus
  );

  await ctx.replyWithMarkdown(
    `🏠 *Главное меню* \n\nАвтопостинг ${autopostingStatusStr} \n\nПоследняя публикация в 16:45 \nобъект № 1608812148905 \n\nСледующая публикация в 19:15 \nобъект № 1608812148905 \n\nОбъектов в базе данных: \nАктивные: *${activeObjectReCount}* \nВ архиве: ${archiveObjectReCount} \nВсего: ${objectReCount} \n\n_Вернуться в Главное меню в любой момент /start_`,
    Markup.inlineKeyboard([
      [
        Markup.callbackButton(
          "Добавить объект",
          JSON.stringify({ type: typesQuery.ADD_OBJECT })
        ),
      ],
      [
        Markup.callbackButton(
          "Все объекты",
          JSON.stringify({ type: typesQuery.ALL_OBJECTS })
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

mainMenu.on("callback_query", checkJSONmw, async (ctx) => {
  const { type } = JSON.parse(ctx.callbackQuery.data);

  let options;

  switch (type) {
    case typesQuery.ADD_OBJECT:
      options = await Options.findOne({}, "contact");
      if (!checkContact(options)) {
        await ctx.answerCbQuery();
        return ctx.replyWithMarkdown(
          "❗️ Невозможно зайти! Заполните информацию о контактах в меню *Настройки*."
        );
      }

      await ctx.answerCbQuery("Добавить объект");
      return ctx.scene.enter("step_object_re_type");

    case typesQuery.ALL_OBJECTS:
      options = await Options.findOne({}, "contact");
      if (!checkContact(options)) {
        await ctx.answerCbQuery();
        return ctx.replyWithMarkdown(
          "❗️ Невозможно зайти! Заполните информацию о контактах в меню *Настройки*."
        );
      }

      const objectReCount = await ObjectRe.estimatedDocumentCount();
      if (!objectReCount) {
        await ctx.answerCbQuery("❗️ Нет добавленных объектов!");
        return ctx.replyWithMarkdown(`❗️ Нет добавленных объектов!`);
      }

      await ctx.answerCbQuery("Все объекты");
      return ctx.scene.enter("step_object_list");

    case typesQuery.MAIN_MENU:
      await ctx.answerCbQuery();
      return ctx.scene.enter("main_menu");

    case typesQuery.SETTINGS:
      await ctx.answerCbQuery();
      return ctx.scene.enter("settings");

    default:
      await ctx.replyWithMarkdown(
        `❗️ Используйте кнопки в меню _Главное меню_.`
      );
      break;
  }

  await ctx.answerCbQuery();
});

mainMenu.use(async (ctx) => {
  await ctx.replyWithMarkdown(`❗️ Используйте кнопки в меню _Главное меню_.`);
});

module.exports = mainMenu;

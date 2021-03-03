const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const {
  typesQuery,
  autopostingStatuses,
  markdownParseMode,
} = require("../../constants");
const {
  getContact,
  getAutopostingStatusStr,
  accessMainMenuMW,
} = require("../../helpers");
const { splitArray } = require("../../utils");
const agenda = require("../../agenda");

const Options = require("../../models/Options");
const User = require("../../models/User");
const ObjectRe = require("../../models/ObjectRe");

const mainSettingBtns = Markup.inlineKeyboard([
  [
    Markup.callbackButton(
      "Включить",
      JSON.stringify({ type: typesQuery.START_AUTOPOSTING })
    ),
    Markup.callbackButton(
      "На паузу",
      JSON.stringify({ type: typesQuery.PAUSE_AUTOPOSTING })
    ),
    Markup.callbackButton(
      "Выключить",
      JSON.stringify({ type: typesQuery.STOP_AUTOPOSTING })
    ),
  ],
  [
    Markup.callbackButton(
      "Автопостинг",
      JSON.stringify({ type: typesQuery.EDIT_AUTOPOSTING })
    ),
    Markup.callbackButton(
      "Контакты",
      JSON.stringify({ type: typesQuery.EDIT_CONTACT })
    ),
  ],
  [
    Markup.callbackButton(
      "Админы",
      JSON.stringify({ type: typesQuery.EDIT_ADMINS })
    ),
    Markup.callbackButton(
      "🏠 Главное меню",
      JSON.stringify({ type: typesQuery.MAIN_MENU })
    ),
  ],
]).extra(markdownParseMode);

const getMainSettingText = (optionsDB) => {
  const { name, email, phones } = getContact(optionsDB.contact);
  const splitAutopostingTime = splitArray(optionsDB.autopostingTime, 4);

  const autopostingTimeStr = splitAutopostingTime.length
    ? splitAutopostingTime.reduce((acc, line, i, lines) => {
        const lineStr = line.join(", ");
        const breakSymnol = lines.length - 1 === i ? "" : ", \n";
        acc += `${lineStr}${breakSymnol}`;
        return acc;
      }, ``)
    : "_Еще не добавлено._";

  const autopostingStatusStr = getAutopostingStatusStr(
    optionsDB.autopostingStatus
  );

  return `⚙️ *Настройки* \n\nАвтопостинг ${autopostingStatusStr} \n\nВремя публикаций (*${optionsDB.autopostingTime.length}* пост/сутки): \n${autopostingTimeStr} \n\nКонтакты: \n${name} \n${email} \n${phones}`;
};

const settings = new Scene("settings");

settings.start(async (ctx) => {
  await ctx.scene.enter("main_menu");
});

settings.enter(accessMainMenuMW, async (ctx) => {
  const optionsDB = await Options.findOne();

  const mainSettingText = getMainSettingText(optionsDB);

  await ctx.replyWithMarkdown(mainSettingText, mainSettingBtns);
});

settings.on("callback_query", async (ctx) => {
  const { type } = JSON.parse(ctx.callbackQuery.data);

  let optionsDB, mainSettingText, objectReCount;

  switch (type) {
    case typesQuery.START_AUTOPOSTING:
      objectReCount = await ObjectRe.estimatedDocumentCount();
      if (!objectReCount) return ctx.answerCbQuery("Нет добавленных объектов!");

      optionsDB = await Options.findOne();
      if (!optionsDB.autopostingTime.length)
        return ctx.answerCbQuery("Не установлено время публикаций!");
      if (optionsDB.autopostingStatus === autopostingStatuses.start.name)
        return ctx.answerCbQuery(
          `Автопостинг уже ${autopostingStatuses.start.text}!`
        );

      optionsDB.autopostingStatus = autopostingStatuses.start.name;
      await optionsDB.save();

      mainSettingText = getMainSettingText(optionsDB);

      await agenda.start();

      await agenda.now("init_post");

      await ctx.editMessageText(mainSettingText, mainSettingBtns);
      return ctx.answerCbQuery(
        `Автопостинг ${autopostingStatuses.start.text}!`
      );

    case typesQuery.STOP_AUTOPOSTING:
      optionsDB = await Options.findOne();
      if (optionsDB.autopostingStatus === autopostingStatuses.stop.name) {
        optionsDB.autopostingSkip = 0;
        await optionsDB.save();
        return ctx.answerCbQuery(
          `Автопостинг уже ${autopostingStatuses.stop.text}!`
        );
      }

      optionsDB.autopostingStatus = autopostingStatuses.stop.name;
      optionsDB.autopostingSkip = 0;
      await optionsDB.save();

      mainSettingText = getMainSettingText(optionsDB);

      await agenda.cancel();
      await agenda.purge();
      await agenda.stop();

      await ctx.editMessageText(mainSettingText, mainSettingBtns);
      return ctx.answerCbQuery(`Автопостинг ${autopostingStatuses.stop.text}!`);

    case typesQuery.PAUSE_AUTOPOSTING:
      objectReCount = await ObjectRe.estimatedDocumentCount();
      if (!objectReCount) return ctx.answerCbQuery("Нет добавленных объектов!");

      optionsDB = await Options.findOne();
      if (optionsDB.autopostingStatus === autopostingStatuses.pause.name)
        return ctx.answerCbQuery(
          `Автопостинг уже ${autopostingStatuses.pause.text}!`
        );

      optionsDB.autopostingStatus = autopostingStatuses.pause.name;
      await optionsDB.save();

      mainSettingText = getMainSettingText(optionsDB);

      await agenda.cancel();
      await agenda.purge();
      await agenda.stop();

      await ctx.editMessageText(mainSettingText, mainSettingBtns);
      return ctx.answerCbQuery(
        `Автопостинг ${autopostingStatuses.pause.text}!`
      );

    case typesQuery.EDIT_CONTACT:
      await ctx.answerCbQuery();
      return ctx.scene.enter("step_edit_contact");

    case typesQuery.EDIT_AUTOPOSTING:
      await ctx.answerCbQuery();
      return ctx.scene.enter("step_edit_autoposting");

    case typesQuery.EDIT_ADMINS:
      const adminDB = await User.findOne({ telegramId: ctx.from.id });
      if (!adminDB.isMainAdmin) return ctx.answerCbQuery("У вас нет доступа!");

      await ctx.answerCbQuery();
      return ctx.scene.enter("step_edit_admins");

    case typesQuery.MAIN_MENU:
      await ctx.answerCbQuery();
      return ctx.scene.enter("main_menu");

    default:
      await ctx.replyWithMarkdown(
        `❗️ Используйте кнопки в меню _Главное меню_.`
      );
      break;
  }

  await ctx.answerCbQuery();
});

settings.use(async (ctx) => {
  await ctx.replyWithMarkdown(`❗️ Используйте кнопки в меню _Главное меню_.`);
});

module.exports = settings;

const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");

const { getItemList, getNumbersIK } = require("../../helpers");
const { typesQuery } = require("../../constants");
const { validateTime } = require("../../utils");

const Options = require("../../models/Options");

const limitTimeSymbols = 5;
const maxPublishedPost = 30;

const moreBtns = [
  Markup.callbackButton(
    "Принять",
    JSON.stringify({
      type: typesQuery.ACCEPT,
    })
  ),
];

const getAutopostingTimeStr = (autopostingTime) => {
  const timesStr = autopostingTime.length
    ? getItemList(autopostingTime)
    : "_Еще не добавлено._";

  return `▶️ *Автопостинг* \n\nВремя публикаций: \n${timesStr} \n\nВведите время публикации, чтобы добавить новое. Чтобы *удалить* время, выберите кнопку с его порядковым номером. \n\nНапример: 01:15`;
};

const stepEditAutoposting = new Scene("step_edit_autoposting");

stepEditAutoposting.enter(async (ctx) => {
  const optionsDB = await Options.findOne({}, "autopostingTime");

  const timesStr = getAutopostingTimeStr(optionsDB.autopostingTime);
  const ik = getNumbersIK(
    optionsDB.autopostingTime,
    typesQuery.DELETE_TIME,
    moreBtns
  );

  const message = await ctx.replyWithMarkdown(timesStr, ik);
  ctx.session.editPostTimeMessageId = message.message_id;
});

stepEditAutoposting.leave(async (ctx) => {
  await ctx.telegram.editMessageReplyMarkup(
    ctx.chat.id,
    ctx.session.editPostTimeMessageId
  );
  delete ctx.session.editPostTimeMessageId;
});

stepEditAutoposting.start(async (ctx) => {
  await ctx.scene.enter("main_menu");
});

stepEditAutoposting.on("text", async (ctx) => {
  const { editPostTimeMessageId } = ctx.session;
  const { text } = ctx.message;

  await ctx.deleteMessage();

  if (text.length > limitTimeSymbols)
    return ctx.replyWithMarkdown(
      `❗️ Вы превысили лимит символов! Попробуйте ввести снова.`
    );

  if (!validateTime(text))
    return ctx.replyWithMarkdown(
      `❗️ Неверный формат времени! Неверно: ${text}`
    );

  const optionsDB = await Options.findOne({}, "autopostingTime");
  if (optionsDB.autopostingTime.includes(text))
    return ctx.replyWithMarkdown(`❗️ Такое время уже добавлено!`);
  if (optionsDB.autopostingTime.length === maxPublishedPost)
    return ctx.replyWithMarkdown(
      `❗️ Невозможно добавить более *${maxPublishedPost}* постов!`
    );

  optionsDB.autopostingTime.push(text);
  optionsDB.autopostingTime.sort();
  await optionsDB.save();

  const timesStr = getAutopostingTimeStr(optionsDB.autopostingTime);
  const ik = getNumbersIK(
    optionsDB.autopostingTime,
    typesQuery.DELETE_TIME,
    moreBtns
  );

  return ctx.telegram.editMessageText(
    ctx.chat.id,
    editPostTimeMessageId,
    null,
    timesStr,
    ik
  );
});

stepEditAutoposting.on("callback_query", async (ctx) => {
  const { type, index } = JSON.parse(ctx.callbackQuery.data);

  let optionsDB, timesStr, ik;

  switch (type) {
    case typesQuery.DELETE_TIME:
      optionsDB = await Options.findOne({}, "autopostingTime");
      optionsDB.autopostingTime.splice(index, 1);
      await optionsDB.save();

      timesStr = getAutopostingTimeStr(optionsDB.autopostingTime);
      ik = getNumbersIK(
        optionsDB.autopostingTime,
        typesQuery.DELETE_TIME,
        moreBtns
      );

      await ctx.answerCbQuery();
      return ctx.editMessageText(timesStr, ik);

    case typesQuery.ACCEPT:
      await ctx.answerCbQuery();
      return ctx.scene.enter("settings");

    default:
      await ctx.replyWithMarkdown(
        `❗️ Используйте кнопки в меню _Автопостинг_.`
      );
      break;
  }

  await ctx.answerCbQuery();
});

stepEditAutoposting.use(async (ctx) => {
  await ctx.replyWithMarkdown(`❗️ Используйте кнопки в меню _Автопостинг_.`);
});

module.exports = stepEditAutoposting;

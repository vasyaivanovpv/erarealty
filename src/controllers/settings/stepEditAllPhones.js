const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");

const { getItemList, getNumbersIK } = require("../../helpers");
const { typesQuery } = require("../../constants");

const Options = require("../../models/Options");
const ObjectRe = require("../../models/ObjectRe");

const limitPhoneSymbols = 20;
const maxPhoneNumbers = 10;

const moreBtns = [
  Markup.callbackButton(
    "Принять",
    JSON.stringify({
      type: typesQuery.ACCEPT,
    })
  ),
];

const getPhonesStr = (phones) => {
  const phonesStr = phones.length
    ? getItemList(phones)
    : "Добавленных номеров нет.";

  return `☎️ *Телефоны* \n\n${phonesStr} \n\nВведите номер телефона, чтобы добавить новый. Чтобы *удалить* номер, выберите кнопку с его порядковым номером. \n\nНапример: +79022070606`;
};

const stepEditAllPhones = new Scene("step_edit_all_phones");

stepEditAllPhones.enter(async (ctx) => {
  const optionsDB = await Options.findOne({}, "contact");

  const phonesStr = getPhonesStr(optionsDB.contact.phones);
  const ik = getNumbersIK(
    optionsDB.contact.phones,
    typesQuery.DELETE_PHONE,
    moreBtns
  );

  const message = await ctx.replyWithMarkdown(phonesStr, ik);
  ctx.session.editPhoneMessageId = message.message_id;
});

stepEditAllPhones.leave(async (ctx) => {
  await ctx.telegram.editMessageReplyMarkup(
    ctx.chat.id,
    ctx.session.editPhoneMessageId
  );
  delete ctx.session.editPhoneMessageId;
});

stepEditAllPhones.start(async (ctx) => {
  await ctx.scene.enter("main_menu");
});

stepEditAllPhones.on("text", async (ctx) => {
  const { editPhoneMessageId } = ctx.session;
  const { text } = ctx.message;

  await ctx.deleteMessage();

  if (text.length > limitPhoneSymbols)
    return ctx.replyWithMarkdown(
      `❗️ Вы превысили лимит символов! Попробуйте ввести снова.`
    );

  const optionsDB = await Options.findOne({}, "contact");
  if (optionsDB.contact.phones.includes(text))
    return ctx.replyWithMarkdown(`❗️ Такой номер уже добавлен!`);
  if (optionsDB.contact.phones.length === maxPhoneNumbers)
    return ctx.replyWithMarkdown(
      `❗️ Невозможно добавить более *${maxPhoneNumbers}* номеров!`
    );

  optionsDB.contact.phones.push(text);
  await optionsDB.save();

  const phonesStr = getPhonesStr(optionsDB.contact.phones);
  const ik = getNumbersIK(
    optionsDB.contact.phones,
    typesQuery.DELETE_PHONE,
    moreBtns
  );

  return ctx.telegram.editMessageText(
    ctx.chat.id,
    editPhoneMessageId,
    null,
    phonesStr,
    ik
  );
});

stepEditAllPhones.on("callback_query", async (ctx) => {
  const { type, index } = JSON.parse(ctx.callbackQuery.data);

  let optionsDB, phonesStr, ik;

  switch (type) {
    case typesQuery.DELETE_PHONE:
      optionsDB = await Options.findOne({}, "contact");
      const objectsRes = await ObjectRe.find({
        phones: optionsDB.contact.phones[index],
      });

      if (objectsRes.length)
        return ctx.answerCbQuery(
          "Невозможно удалить! Номер привязан к объявлениям!"
        );

      optionsDB.contact.phones.splice(index, 1);
      await optionsDB.save();

      phonesStr = getPhonesStr(optionsDB.contact.phones);
      ik = getNumbersIK(
        optionsDB.contact.phones,
        typesQuery.DELETE_PHONE,
        moreBtns
      );

      await ctx.answerCbQuery();
      return ctx.editMessageText(phonesStr, ik);

    case typesQuery.ACCEPT:
      await ctx.answerCbQuery();
      return ctx.scene.enter("step_edit_contact");

    default:
      await ctx.replyWithMarkdown(`❗️ Используйте кнопки в меню _Телефон_.`);
      break;
  }

  await ctx.answerCbQuery();
});

stepEditAllPhones.use(async (ctx) =>
  ctx.replyWithMarkdown(`❗️ Введите пожалуйста номер телефона!`)
);

module.exports = stepEditAllPhones;

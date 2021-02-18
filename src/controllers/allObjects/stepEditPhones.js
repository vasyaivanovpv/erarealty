const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const { getItemList, getNumbersIK } = require("../../helpers");
const { typesQuery } = require("../../constants");

const Options = require("../../models/Options");
const ObjectRe = require("../../models/ObjectRe");

const limitPhoneSymbols = 20;
const maxPhoneNumbersOnPost = 3;
const maxPhoneNumbers = 10;

const moreBtns = [
  Markup.callbackButton(
    "Принять",
    JSON.stringify({
      type: typesQuery.ACCEPT,
    })
  ),
];

const getPhonesStr = (phones, postPhones) => {
  const phonesStr = phones.length
    ? getItemList(phones, postPhones)
    : "Добавленных номеров нет.";

  return `☎️ *Редактировать телефоны* \n\n${phonesStr} \n\nВыберите номера телефонов, которые будут прикреплине к объявлению. Чтобы добавить новый телефон, введите его. \n\nНапример: +79022070606`;
};

const stepEditPhones = new Scene("step_edit_phones");

stepEditPhones.enter(async (ctx) => {
  const { point } = ctx.session.editObjectRe;

  const objectReDB = await ObjectRe.findOne({ point: point });
  const optionsDB = await Options.findOne({}, "contact");

  const phonesStr = getPhonesStr(optionsDB.contact.phones, objectReDB.phones);
  const ik = getNumbersIK(
    optionsDB.contact.phones,
    typesQuery.ADD_PHONE,
    moreBtns
  );

  const message = await ctx.replyWithMarkdown(phonesStr, ik);
  ctx.session.editPhoneMessageId = message.message_id;
});

stepEditPhones.leave(async (ctx) => {
  await ctx.telegram.editMessageReplyMarkup(
    ctx.chat.id,
    ctx.session.editPhoneMessageId
  );
  delete ctx.session.editPhoneMessageId;
});

stepEditPhones.start(async (ctx) => {
  await ctx.scene.enter("main_menu");
});

stepEditPhones.on("text", async (ctx) => {
  const { editPhoneMessageId } = ctx.session;
  const { text } = ctx.message;
  const { point } = ctx.session.editObjectRe;

  await ctx.deleteMessage();

  if (text.length > limitPhoneSymbols)
    return ctx.replyWithMarkdown(`❗️ Вы превысили лимит символов!`);

  const optionsDB = await Options.findOne({}, "contact");
  if (optionsDB.contact.phones.includes(text))
    return ctx.replyWithMarkdown(`❗️ Такой номер уже добавлен!`);
  if (optionsDB.contact.phones.length === maxPhoneNumbers)
    return ctx.replyWithMarkdown(
      `❗️ Невозможно добавить более *${maxPhoneNumbers}* номеров!`
    );

  optionsDB.contact.phones.push(text);
  await optionsDB.save();

  const objectReDB = await ObjectRe.findOne({ point: point });

  const phonesStr = getPhonesStr(optionsDB.contact.phones, objectReDB.phones);
  const ik = getNumbersIK(
    optionsDB.contact.phones,
    typesQuery.ADD_PHONE,
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

stepEditPhones.on("callback_query", async (ctx) => {
  const { type, index } = JSON.parse(ctx.callbackQuery.data);
  const { point } = ctx.session.editObjectRe;

  let optionsDB, phonesStr, ik;

  switch (type) {
    case typesQuery.ADD_PHONE:
      optionsDB = await Options.findOne({}, "contact");
      const phone = optionsDB.contact.phones[index];

      const objectReDB = await ObjectRe.findOne({ point: point });

      if (objectReDB.phones.includes(phone)) {
        objectReDB.phones.splice(objectReDB.phones.indexOf(phone), 1);
      } else if (objectReDB.phones.length < maxPhoneNumbersOnPost) {
        objectReDB.phones.push(phone);
      } else {
        return ctx.answerCbQuery(
          `Невозможно добавить более ${maxPhoneNumbersOnPost} номеров!`
        );
      }
      await objectReDB.save();

      phonesStr = getPhonesStr(optionsDB.contact.phones, objectReDB.phones);
      ik = getNumbersIK(
        optionsDB.contact.phones,
        typesQuery.ADD_PHONE,
        moreBtns
      );

      await ctx.answerCbQuery();
      return ctx.editMessageText(phonesStr, ik);

    case typesQuery.ACCEPT:
      await ctx.answerCbQuery();
      return ctx.scene.enter("step_edit_object_re");

    default:
      await ctx.replyWithMarkdown(`❗️ Используйте кнопки в меню _Телефон_.`);
      break;
  }

  await ctx.answerCbQuery();
});

stepEditPhones.use(async (ctx) =>
  ctx.replyWithMarkdown(`❗️ Введите пожалуйста номер телефона!`)
);

module.exports = stepEditPhones;

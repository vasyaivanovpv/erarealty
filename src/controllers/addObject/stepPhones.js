const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const { getItemList, getNumbersIK } = require("../../helpers");
const { typesQuery } = require("../../constants");

const Options = require("../../models/Options");

const limitPhoneSymbols = 20;
const maxPhoneNumbersOnPost = 3;
const maxPhoneNumbers = 10;

const moreBtns = [
  Markup.callbackButton(
    "Принять",
    JSON.stringify({
      type: typesQuery.NEXT_STEP,
    })
  ),
];

const getPhonesStr = (phones, postPhones) => {
  const phonesStr = phones.length
    ? getItemList(phones, postPhones)
    : "Добавленных номеров нет.";

  return `☎️ *Телефоны* \n\n${phonesStr} \n\nВыберите номера телефонов, которые будут прикреплине к объявлению. Чтобы добавить новый телефон, введите его. \n\nНапример: +79022070606`;
};

const stepPhones = new Scene("step_phones");

stepPhones.enter(async (ctx) => {
  const optionsDB = await Options.findOne({}, "contact");

  const phonesStr = getPhonesStr(optionsDB.contact.phones);
  const ik = getNumbersIK(
    optionsDB.contact.phones,
    typesQuery.ADD_PHONE,
    moreBtns
  );

  const message = await ctx.replyWithMarkdown(phonesStr, ik);
  ctx.session.editPhoneMessageId = message.message_id;
});

stepPhones.leave(async (ctx) => {
  await ctx.telegram.editMessageReplyMarkup(
    ctx.chat.id,
    ctx.session.editPhoneMessageId
  );
  delete ctx.session.editPhoneMessageId;
});

stepPhones.start(async (ctx) => {
  await ctx.scene.enter("main_menu");
});

stepPhones.on("text", async (ctx) => {
  const { editPhoneMessageId, post } = ctx.session;
  const { text } = ctx.message;

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

  const phonesStr = getPhonesStr(optionsDB.contact.phones, post.phones);
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

stepPhones.on("callback_query", async (ctx) => {
  const { type, index } = JSON.parse(ctx.callbackQuery.data);
  const { post } = ctx.session;

  let optionsDB, phonesStr, ik;

  switch (type) {
    case typesQuery.ADD_PHONE:
      optionsDB = await Options.findOne({}, "contact");
      const phone = optionsDB.contact.phones[index];

      if (post.phones.includes(phone)) {
        ctx.session.post.phones.splice(post.phones.indexOf(phone), 1);
      } else if (post.phones.length < maxPhoneNumbersOnPost) {
        ctx.session.post.phones.push(phone);
      } else {
        return ctx.answerCbQuery(
          `Невозможно добавить более ${maxPhoneNumbersOnPost} номеров!`
        );
      }

      phonesStr = getPhonesStr(optionsDB.contact.phones, post.phones);
      ik = getNumbersIK(
        optionsDB.contact.phones,
        typesQuery.ADD_PHONE,
        moreBtns
      );

      await ctx.answerCbQuery();
      return ctx.editMessageText(phonesStr, ik);

    case typesQuery.NEXT_STEP:
      await ctx.answerCbQuery();
      return ctx.scene.enter("step_save_object_re");

    default:
      await ctx.replyWithMarkdown(`❗️ Используйте кнопки в меню _Телефон_.`);
      break;
  }

  await ctx.answerCbQuery();
});

stepPhones.use(async (ctx) =>
  ctx.replyWithMarkdown(`❗️ Введите пожалуйста номер телефона!`)
);

module.exports = stepPhones;

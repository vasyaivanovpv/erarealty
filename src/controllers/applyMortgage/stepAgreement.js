const { ADMIN_CHAT } = require("../../config");

const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const { typesQuery } = require("../../constants");
const { escapeChar, formatPrice } = require("../../utils");
const { createMiniCaption } = require("../../helpers");

const ObjectRe = require("../../models/ObjectRe");

const stepAgreement = new Scene("step_agreement");

stepAgreement.start(async (ctx) => {
  await ctx.scene.enter("public_main_menu");
});

stepAgreement.enter(async (ctx) => {
  return ctx.replyWithMarkdown(
    `👍 *Завершение* \n\nПодтверждаю свое согласие на обработку и передачу моих персональных данных по открытым каналам Интернет, в целях определения необходимого мне коммерческого предложения, информирования меня о нем. Отправляя данную заявку, я понимаю и соглашаюсь с тем, что указанная в заявке информация будет передана для дальнейшей работы со мной как с потенциальным клиентом-заемщиком.`,
    Markup.inlineKeyboard([
      Markup.callbackButton(
        "ПОДТВЕРЖДАЮ",
        JSON.stringify({ type: typesQuery.AGREEMENT })
      ),
    ]).extra()
  );
});

stepAgreement.on("callback_query", async (ctx) => {
  const { type } = JSON.parse(ctx.callbackQuery.data);
  const { id, first_name, last_name } = ctx.from;
  const userName = [first_name, last_name].filter((v) => v).join(" ");
  const { applyMortgage } = ctx.session;

  switch (type) {
    case typesQuery.AGREEMENT:
      const objectReDB = await ObjectRe.findOne({ point: applyMortgage.point });

      const formatDownPayment = formatPrice(applyMortgage.downPayment);
      const escapeUserName = escapeChar(userName);
      const escapeFio = escapeChar(applyMortgage.fio);
      const escapeSeniority = escapeChar(applyMortgage.seniority);
      const escapePhone = escapeChar(applyMortgage.phone);
      const escapeConvenientTime = escapeChar(applyMortgage.convenientTime);
      const escapeEmail = escapeChar(applyMortgage.email);

      const miniCaption = createMiniCaption(objectReDB);
      const applyCaption = `*НОВАЯ ЗАЯВКА* \n\n${miniCaption} \n\n*${escapeFio}* \nВозраст: *${applyMortgage.age}* \nЧленов семьи: *${applyMortgage.numberFamilyMembers}* \n\nПерв-ный взнос: *${formatDownPayment} ₽* \nСтаж: ${escapeSeniority} \n\n*Контакты* \nТелефон: ${escapePhone} \nУдобное время: ${escapeConvenientTime} \nEmail: ${escapeEmail} \nПришло от: [${escapeUserName}](tg://user?id=${id})`;

      await ctx.telegram.sendMessage(
        ADMIN_CHAT,
        applyCaption,
        Markup.inlineKeyboard([
          Markup.callbackButton(
            "Принять заявку",
            JSON.stringify({ type: typesQuery.ACCEPT })
          ),
        ]).extra({ parse_mode: "Markdown" })
      );

      await ctx.editMessageText(
        "👍 *Завершение* \n\nВаша заявка оформлена, с вами свяжутся в ближайшее время по указанным вами контактам!",
        { parse_mode: "Markdown" }
      );

      await ctx.answerCbQuery("Заявка оформлена");
      return ctx.scene.enter("public_main_menu");

    default:
      await ctx.replyWithMarkdown(
        `❗️ Используйте кнопки в меню _Заявка на ипотеку_.`
      );
      break;
  }

  await ctx.answerCbQuery();
});

stepAgreement.use(async (ctx) => {
  await ctx.replyWithMarkdown(
    `❗️ Используйте кнопки в меню _Заявка на ипотеку_.`
  );
});

module.exports = stepAgreement;

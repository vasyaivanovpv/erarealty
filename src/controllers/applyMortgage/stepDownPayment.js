const Scene = require("telegraf/scenes/base");
const { textBlockLimits } = require("../../constants");
const { isInteger } = require("../../utils");

const stepDownPayment = new Scene("step_down_payment");

stepDownPayment.enter(async (ctx) => {
  return ctx.replyWithMarkdown(
    `💲 *Первоначальный взнос* \n\nВведите первоначальный взнос, на который вы рассчитываете. \n\nНапример: 225000`
  );
});

stepDownPayment.start(async (ctx) => {
  await ctx.scene.enter("public_main_menu");
});

stepDownPayment.on("text", async (ctx) => {
  if (ctx.message.text.length > textBlockLimits.PRICE) {
    return ctx.replyWithMarkdown(
      `❗️ Вы превысили лимит символов! Попробуйте ввести снова.`
    );
  }

  const downPayment = Number(ctx.message.text);

  if (!isInteger(downPayment)) {
    return ctx.replyWithMarkdown(
      `❗️ Введите целочисленное значение как указано в примере!`
    );
  }

  ctx.session.applyMortgage.downPayment = downPayment;

  return ctx.scene.enter("step_fio");
});

stepDownPayment.use(async (ctx) => {
  return ctx.replyWithMarkdown(`❗️ Введите пожалуйста первоначальный взнос!`);
});

module.exports = stepDownPayment;

const Scene = require("telegraf/scenes/base");
const { textBlockLimits } = require("../../constants");
const { isInteger } = require("../../utils");

const stepPrice = new Scene("step_price");

stepPrice.enter(async (ctx) => {
  return ctx.replyWithMarkdown(
    `💲 *Стоимость* \n\nВведите стоимость недвижимости в российских рублях. \n\nНапример: 2255000`
  );
});

stepPrice.start(async (ctx) => {
  await ctx.scene.enter("main_menu");
});

stepPrice.on("text", async (ctx) => {
  if (ctx.message.text.length > textBlockLimits.PRICE) {
    return ctx.replyWithMarkdown(
      `❗️ Вы превысили лимит символов! Попробуйте ввести снова.`
    );
  }

  const price = Number(ctx.message.text);

  if (!isInteger(price)) {
    return ctx.replyWithMarkdown(
      `❗️ Введите целочисленное значение арендной платы как указано в примере!`
    );
  }

  ctx.session.post.price = price;

  return ctx.scene.enter("step_district");
});

stepPrice.use(async (ctx) => {
  return ctx.replyWithMarkdown(
    `❗️ Введите пожалуйста стоимость недвижимости!`
  );
});

module.exports = stepPrice;

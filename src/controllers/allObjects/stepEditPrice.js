const Scene = require("telegraf/scenes/base");
const { textBlockLimits } = require("../../constants");
const { isInteger } = require("../../utils");

const ObjectRe = require("../../models/ObjectRe");

const stepEditPrice = new Scene("step_edit_price");

stepEditPrice.enter(async (ctx) => {
  return ctx.replyWithMarkdown(
    `💲 *Редактировать стоимость* \n\nВведите стоимость недвижимости в российских рублях. \n\nНапример: 2255000`
  );
});

stepEditPrice.start(async (ctx) => {
  await ctx.scene.enter("main_menu");
});

stepEditPrice.on("text", async (ctx) => {
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

  await ObjectRe.updateOne(
    { point: ctx.session.editObjectRe.point },
    { price: price }
  );

  return ctx.scene.enter("step_edit_object_re");
});

stepEditPrice.use(async (ctx) => {
  return ctx.replyWithMarkdown(
    `❗️ Введите пожалуйста стоимость недвижимости!`
  );
});

module.exports = stepEditPrice;

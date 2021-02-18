const Scene = require("telegraf/scenes/base");
const { isFloat, toNumber } = require("../../utils");
const { textBlockLimits } = require("../../constants");

const stepTotalArea = new Scene("step_total_area");

stepTotalArea.enter(async (ctx) => {
  return ctx.replyWithMarkdown(
    `🧰 *Общая площадь* \n\nВведите общую площадь в квадратных метрах. \n\nНапример: 44.6`
  );
});

stepTotalArea.start(async (ctx) => {
  await ctx.scene.enter("main_menu");
});

stepTotalArea.on("text", async (ctx) => {
  if (ctx.message.text.length > textBlockLimits.TOTAL_AREA) {
    return ctx.replyWithMarkdown(
      `❗️ Вы превысили лимит символов! Попробуйте ввести снова.`
    );
  }

  const area = toNumber(ctx.message.text);

  if (!isFloat(area))
    return ctx.replyWithMarkdown(`❗️ Введите только числовое значение!`);

  ctx.session.post.totalArea = area;

  return ctx.scene.enter("step_photo");
});

stepTotalArea.use(async (ctx) => {
  return ctx.replyWithMarkdown(`❗️ Введите пожалуйста общую площадь!`);
});

module.exports = stepTotalArea;

const Scene = require("telegraf/scenes/base");
const { textBlockLimits } = require("../../constants");
const { isFloat, toNumber } = require("../../utils");

const stepApartAreas = new Scene("step_apart_areas");

stepApartAreas.enter(async (ctx) => {
  return ctx.replyWithMarkdown(
    `🧰 *Площадь квартиры* \n\nВведите данные о площади квартиры (*общая площадь, жилая площадь, площадь кухни*) в указанном порядке через символ "/". \n\nНапример: 76/42.6/12.2`
  );
});

stepApartAreas.start(async (ctx) => {
  await ctx.scene.enter("main_menu");
});

stepApartAreas.on("text", async (ctx) => {
  if (
    ctx.message.text.length >
    textBlockLimits.TOTAL_AREA +
      textBlockLimits.LIVING_AREA +
      textBlockLimits.KITCHEN_AREA
  ) {
    return ctx.replyWithMarkdown(
      `❗️ Вы превысили лимит символов! Попробуйте ввести снова.`
    );
  }

  const parseText = ctx.message.text.split("/");
  if (parseText.length < 3)
    return ctx.replyWithMarkdown(`❗️ Введите все необходимые параметры!`);
  if (parseText.length > 3)
    return ctx.replyWithMarkdown(`❗️ Введите только необходимые параметры!`);

  const totalArea = toNumber(parseText[0]);
  if (!isFloat(totalArea))
    return ctx.replyWithMarkdown(
      `❗️ Введите числовое значение для параметра "общая площадь"!`
    );
  const livingArea = toNumber(parseText[1]);
  if (!isFloat(livingArea))
    return ctx.replyWithMarkdown(
      `❗️ Введите числовое значение для параметра "жилая площадь"!`
    );
  const kitchenArea = toNumber(parseText[2]);
  if (!isFloat(kitchenArea))
    return ctx.replyWithMarkdown(
      `❗️ Введите числовое значение для параметра "площадь кухни"!`
    );
  if (totalArea < livingArea + kitchenArea)
    return ctx.replyWithMarkdown(
      `❗️ Введите корректные значение! Общая площадь не может быть меньше суммы остальных площадей!`
    );

  ctx.session.post.totalArea = totalArea;
  ctx.session.post.livingArea = livingArea;
  ctx.session.post.kitchenArea = kitchenArea;

  return ctx.scene.enter("step_number_rooms");
});

stepApartAreas.use(async (ctx) => {
  return ctx.replyWithMarkdown(`❗️ Введите пожалуйста площадь квартиры!`);
});

module.exports = stepApartAreas;

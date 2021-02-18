const Scene = require("telegraf/scenes/base");
const { textBlockLimits } = require("../../constants");
const { isInteger, toNumber } = require("../../utils");

const stepFloor = new Scene("step_floor");

stepFloor.enter(async (ctx) => {
  return ctx.replyWithMarkdown(
    `🏙 *Этаж* \n\nВведите этаж, а также количество этажей в доме, разделяя эти значения символом "/" как указано в примере. \n\nПример: 7/10`
  );
});

stepFloor.start(async (ctx) => {
  await ctx.scene.enter("main_menu");
});

stepFloor.on("text", async (ctx) => {
  if (ctx.message.text.length > textBlockLimits.FLOOR) {
    return ctx.replyWithMarkdown(
      `❗️ Вы превысили лимит символов! Попробуйте ввести снова.`
    );
  }

  const parseText = ctx.message.text.split("/");
  if (parseText.length < 2)
    return ctx.replyWithMarkdown(`❗️ Введите все необходимые параметры!`);
  if (parseText.length > 2)
    return ctx.replyWithMarkdown(`❗️ Введите только необходимые параметры!`);

  const currentFloor = toNumber(parseText[0]);
  if (!isInteger(currentFloor))
    return ctx.replyWithMarkdown(
      `❗️ Введите целочисленные значения для параметра "этаж квартиры"!`
    );
  const totalFloor = toNumber(parseText[1]);
  if (!isInteger(totalFloor))
    return ctx.replyWithMarkdown(
      `❗️ Введите целочисленные значения для параметра "количество этажей в доме"!`
    );

  if (currentFloor > totalFloor) {
    return ctx.replyWithMarkdown(
      `❗️ Введите правильные значения этажей. Текущий этаж не может быть больше максимального количества этажей в доме!`
    );
  }

  ctx.session.post.floor.current = currentFloor;
  ctx.session.post.floor.total = totalFloor;

  return ctx.scene.enter("step_photo");
});

stepFloor.use(async (ctx) => {
  return ctx.replyWithMarkdown(
    `❗️ Введите значения этажей как указано в примере!`
  );
});

module.exports = stepFloor;

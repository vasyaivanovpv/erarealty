const Scene = require("telegraf/scenes/base");
const { getFilterObject } = require("../../helpers");

const ObjectRe = require("../../models/ObjectRe");

const stepFindByPoint = new Scene("step_find_by_point");

stepFindByPoint.enter(async (ctx) => {
  return ctx.replyWithMarkdown(
    `🔍 *Поиск объекта по №* \n\nВведите номер объекта недвижимости. \n\nНапример: 1608751933125`
  );
});

stepFindByPoint.start(async (ctx) => {
  await ctx.scene.enter("main_menu");
});

stepFindByPoint.on("text", async (ctx) => {
  const { text } = ctx.message;
  const { allObjects } = ctx.session;

  const filterDB = getFilterObject(allObjects.filter);
  filterDB.point = text;

  const objectReDB = await ObjectRe.findOne(filterDB);
  if (!objectReDB)
    return ctx.replyWithMarkdown(
      `❗️ Объект недвижимости не найден. Введите номер объекта еще раз!`
    );

  ctx.session.editObjectRe.point = text;

  return ctx.scene.enter("step_edit_object_re");
});

stepFindByPoint.use(async (ctx) => {
  return ctx.replyWithMarkdown(`❗️ Введите номер объекта недвижимости.`);
});

module.exports = stepFindByPoint;

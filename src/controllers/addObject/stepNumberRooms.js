const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const { numberRoomTags } = require("../../constants");

const numberRoomKeys = Object.keys(numberRoomTags);

const stepNumberRooms = new Scene("step_number_rooms");

stepNumberRooms.enter(async (ctx) => {
  const ik = numberRoomKeys.map((key) => {
    return Markup.callbackButton(key, key);
  });

  await ctx.replyWithMarkdown(
    `🔢 *Количество комнат в квартире* \n\nВыберите количество комнат в квартире.`,
    Markup.inlineKeyboard(ik, { columns: 4 }).extra()
  );
});

stepNumberRooms.start(async (ctx) => {
  await ctx.scene.enter("main_menu");
});

stepNumberRooms.action(numberRoomKeys, async (ctx) => {
  const { data } = ctx.callbackQuery;

  const numberRooms = +data ? +data : data;

  ctx.session.post.numberRooms = numberRooms;

  await ctx.answerCbQuery(numberRooms);
  return ctx.scene.enter(`step_floor`);
});

stepNumberRooms.use(async (ctx) => {
  return ctx.replyWithMarkdown(
    `❗️ Выберите пожалуйста количество комнат в квартире!`
  );
});

module.exports = stepNumberRooms;

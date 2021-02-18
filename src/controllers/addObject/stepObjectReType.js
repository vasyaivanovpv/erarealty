const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const { objectReTypes } = require("../../constants");

const objectReTypesKeys = Object.keys(objectReTypes);

const stepObjectTypeRE = new Scene("step_object_re_type");

stepObjectTypeRE.enter(async (ctx) => {
  ctx.session.post = {
    objectReType: "",
    totalArea: 0,
    livingArea: 0,
    kitchenArea: 0,
    numberRooms: 0,
    floor: {
      current: 0,
      total: 0,
    },
    photo: null,
    price: 0,
    district: "",
    address: "",
    mortgage: false,
    extra: "",
    phones: [],
    point: 0,
  };

  const ik = objectReTypesKeys.map((key) =>
    Markup.callbackButton(objectReTypes[key], key)
  );

  return ctx.replyWithMarkdown(
    `🧰 *Тип недвижимости* \n\nВыберите тип недвижимости из представленных.`,
    Markup.inlineKeyboard(ik, { columns: 3 }).extra()
  );
});

stepObjectTypeRE.start(async (ctx) => {
  await ctx.scene.enter("main_menu");
});

stepObjectTypeRE.action(objectReTypesKeys, async (ctx) => {
  const { data } = ctx.callbackQuery;

  ctx.session.post.objectReType = objectReTypes[data];

  await ctx.answerCbQuery(objectReTypes[data]);

  return objectReTypes[data] === objectReTypes.apart
    ? ctx.scene.enter("step_apart_areas")
    : ctx.scene.enter("step_total_area");
});

stepObjectTypeRE.use(async (ctx) => {
  return ctx.replyWithMarkdown(`❗️ Выберите пожалуйста тип недвижимости!`);
});

module.exports = stepObjectTypeRE;

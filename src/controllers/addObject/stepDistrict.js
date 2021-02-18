const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const { typesQuery } = require("../../constants");
const { checkJSONmw } = require("../../helpers");

const District = require("../../models/District");

const stepDistrict = new Scene("step_district");

stepDistrict.enter(async (ctx) => {
  return ctx.replyWithMarkdown(
    `🌐 *Расположение, район* \n\nВведите наименование района, в котором находится недвижимость.`
  );
});

stepDistrict.start(async (ctx) => {
  await ctx.scene.enter("main_menu");
});

stepDistrict.on("text", async (ctx) => {
  const { text } = ctx.message;

  const regExpDistrict = new RegExp(text, "i");
  const districtsDB = await District.find({
    name: { $regex: regExpDistrict },
  });

  if (districtsDB.length) {
    const ik = districtsDB.map((district) =>
      Markup.callbackButton(
        district.name,
        JSON.stringify({ type: typesQuery.DISTRICT, id: district._id })
      )
    );

    return ctx.replyWithMarkdown(
      `❗️ *Поиск расположения* \n\nПо Вашему запросу найдены районы, выберите необходимый! \n\n_Для того чтобы выбрать другое расположение, введите еще раз наименование района._`,
      Markup.inlineKeyboard(ik, { columns: 1 }).extra()
    );
  } else {
    return ctx.replyWithMarkdown(
      `❗️ Ничего не найдено! Введите правильное наименование райнона.`
    );
  }
});

stepDistrict.on("callback_query", checkJSONmw, async (ctx) => {
  const { type, id } = JSON.parse(ctx.callbackQuery.data);

  const districtDB = await District.findById(id);

  switch (type) {
    case typesQuery.DISTRICT:
      ctx.session.post.district = districtDB.name;

      await ctx.answerCbQuery(districtDB.name);
      return ctx.scene.enter("step_address");
    default:
      await ctx.replyWithMarkdown(
        `❗️ Введите пожалуйста наименование района!`
      );
      break;
  }

  await ctx.answerCbQuery();
});

stepDistrict.use(async (ctx) => {
  return ctx.replyWithMarkdown(`❗️ Введите пожалуйста наименование района!`);
});

module.exports = stepDistrict;

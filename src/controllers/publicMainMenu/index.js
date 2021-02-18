const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const { typesQuery } = require("../../constants");
const {
  checkJSONmw,
  createMiniCaption,
  accessPublicMenuMW,
} = require("../../helpers");

const ObjectRe = require("../../models/ObjectRe");

const publicMainMenu = new Scene("public_main_menu");

publicMainMenu.start(async (ctx) => {
  return ctx.scene.enter("public_main_menu");
});

publicMainMenu.enter(accessPublicMenuMW, async (ctx) => {
  ctx.session.applyMortgage = {
    point: 0,
    downPayment: 0,
    fio: "",
    age: 0,
    numberFamilyMembers: 0,
    seniority: "",
    phone: "",
    convenientTime: "",
    email: "",
  };

  if (!ctx.startPayload)
    return ctx.replyWithMarkdown(
      `Здравствуйте! \nЕсли вы хотите купить недвижимость в Пензе, то посмотрите наши объекты на канале t.me/realty\\_penza.`
    );

  ctx.session.applyMortgage.point = +ctx.startPayload;

  const objectReDB = await ObjectRe.findOne({ point: +ctx.startPayload });

  if (!objectReDB)
    return ctx.replyWithMarkdown(
      `❗️ Что-то пошло не так, возможно данный объект недвижимости уже продан! \n\nПосмотрите другие наши объекты на канале t.me/realty\\_penza.`
    );

  const miniCaption = createMiniCaption(objectReDB);

  return ctx.replyWithMarkdown(
    `🏠 *Заявка на ипотеку* \n\nПодав заявку на ипотеку и приобретение этого жилья, с вами свяжется сотрудник агентства недвижимости «ЭРА» группа компаний и предложит наилучшие варианты кредитования и приобретения этого жилья. \n\nОбъект недвижимости\n${miniCaption} \n\n_Отменить подачу заявки в любой момент /start_`,
    Markup.inlineKeyboard([
      Markup.callbackButton(
        "Подать заявку",
        JSON.stringify({ type: typesQuery.APPLY_MORTGAGE })
      ),
    ]).extra()
  );
});

publicMainMenu.on("callback_query", checkJSONmw, async (ctx) => {
  const { type } = JSON.parse(ctx.callbackQuery.data);

  switch (type) {
    case typesQuery.APPLY_MORTGAGE:
      const scene = !ctx.session.applyMortgage.point
        ? "public_main_menu"
        : "step_down_payment";

      await ctx.answerCbQuery();
      return ctx.scene.enter(scene);

    default:
      await ctx.replyWithMarkdown(
        `❗️ Используйте кнопки в меню _Заявка на ипотеку_.`
      );
      break;
  }

  await ctx.answerCbQuery();
});

publicMainMenu.use(async (ctx) => {
  if (!ctx.session.applyMortgage.point)
    return ctx.scene.enter("public_main_menu");
  await ctx.replyWithMarkdown(
    `❗️ Используйте кнопки в меню _Заявка на ипотеку_.`
  );
});

module.exports = publicMainMenu;

const Scene = require("telegraf/scenes/base");
const rateLimit = require("telegraf-ratelimit");
const Markup = require("telegraf/markup");
const { typesQuery, objectReTypes } = require("../../constants");
const {
  createCaption,
  checkJSONmw,
  accessMainMenuMW,
} = require("../../helpers");

const User = require("../../models/User");
const ObjectRe = require("../../models/ObjectRe");
const District = require("../../models/District");

const limitConfig = {
  window: 1000,
  limit: 1,
  keyGenerator: function (ctx) {
    return ctx.chat.id;
  },
  onLimitExceeded: async (ctx) =>
    await ctx.reply("❗️ Не стоит так торопиться! Попробуйте еще раз!"),
};

const stepSaveObjectRe = new Scene("step_save_object_re");

stepSaveObjectRe.use(rateLimit(limitConfig));

stepSaveObjectRe.enter(accessMainMenuMW, async (ctx) => {
  const { post } = ctx.session;

  ctx.session.post.point = new Date().getTime();

  const caption = await createCaption(post);

  if (typeof post.photo === "string") {
    await ctx.replyWithPhoto(post.photo, {
      caption: caption,
      parse_mode: "MarkdownV2",
    });
  } else if (Array.isArray(post.photo)) {
    const photoObj = post.photo.map((file) => ({
      type: "photo",
      media: file,
    }));
    photoObj[0].caption = caption;
    photoObj[0].parse_mode = "MarkdownV2";
    await ctx.replyWithMediaGroup(photoObj);
  }

  return ctx.replyWithMarkdown(
    `👍 *Публикация* \n\nВот так выглядит объявление о продаже объекта недвижимости.\n*Проверьте правильно ли введена информация.* \n\n_Сохранить_ - сохранить объявление в базе данных. \n_Отменить_ - вернуться в _Главное меню_.`,
    Markup.inlineKeyboard([
      Markup.callbackButton(
        "Сохранить",
        JSON.stringify({ type: typesQuery.SEND })
      ),
      Markup.callbackButton(
        "Отменить",
        JSON.stringify({ type: typesQuery.MAIN_MENU })
      ),
    ]).extra()
  );
});

stepSaveObjectRe.start(async (ctx) => {
  return ctx.scene.enter("main_menu");
});

stepSaveObjectRe.on("callback_query", checkJSONmw, async (ctx) => {
  const { type } = JSON.parse(ctx.callbackQuery.data);

  switch (type) {
    case typesQuery.MAIN_MENU:
      await ctx.answerCbQuery();
      return ctx.scene.enter("main_menu");

    case typesQuery.SEND:
      const { post } = ctx.session;

      const userDB = await User.findOne({ telegramId: ctx.from.id });

      const districtDB = await District.findOne({
        name: post.district,
      });

      const newPostParams = {
        date: new Date(),
        user: userDB,
        objectReType: post.objectReType,
        totalArea: post.totalArea,
        photo: post.photo,
        extra: post.extra,
        price: post.price,
        district: districtDB,
        address: post.address,
        phones: post.phones,
        point: post.point,
      };

      if (post.objectReType === objectReTypes.apart) {
        newPostParams.livingArea = post.livingArea;
        newPostParams.kitchenArea = post.kitchenArea;
        newPostParams.numberRooms = post.numberRooms;
        newPostParams.floor = {
          current: post.floor.current,
          total: post.floor.total,
        };
      }

      await ObjectRe.create(newPostParams);

      await ctx.answerCbQuery("Объект добавлен!");
      return ctx.editMessageText(
        `👍 *Завершение* \n\nВаше объявление добавлено в базу данных. Теперь вы можете его увидеть в меню "Все объекты".`,
        Markup.inlineKeyboard([
          Markup.callbackButton(
            "🏠 Главное меню",
            JSON.stringify({ type: typesQuery.MAIN_MENU })
          ),
        ]).extra({ parse_mode: "Markdown" })
      );
    default:
      await ctx.replyWithMarkdown(`❗️ Используй кнопки`);
      break;
  }

  await ctx.answerCbQuery();
});

stepSaveObjectRe.use(async (ctx) =>
  ctx.replyWithMarkdown(`❗️ Используй кнопки`)
);

module.exports = stepSaveObjectRe;

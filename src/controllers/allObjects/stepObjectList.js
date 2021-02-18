const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const {
  typesQuery,
  objectReFilters,
  numbersObjectReOnPage,
  markSymbol,
} = require("../../constants");
const {
  checkJSONmw,
  getFilterObject,
  createMiniCaption,
  accessMainMenuMW,
} = require("../../helpers");
const { splitArray } = require("../../utils");

const ObjectRe = require("../../models/ObjectRe");
const Options = require("../../models/Options");

const filterKeys = Object.keys(objectReFilters);

const switchBtns = (btns, value) =>
  btns.map((btn) => {
    const parseData = JSON.parse(btn.callback_data);
    if (parseData.value === value) {
      return Markup.callbackButton(
        `${markSymbol} ${btn.text}`,
        btn.callback_data
      );
    } else {
      return btn.text.match(markSymbol)
        ? Markup.callbackButton(btn.text.slice(2), btn.callback_data)
        : Markup.callbackButton(btn.text, btn.callback_data);
    }
  });

const getAllObjectsKeyboard = async (filter, firstPage, currentPage, limit) => {
  const filterDB = getFilterObject(filter);
  const objectReCount = await ObjectRe.countDocuments(filterDB);
  const lastPage = Math.ceil(objectReCount / limit);
  const prevPage = currentPage === firstPage ? firstPage : currentPage - 1;
  const nextPage = currentPage === lastPage ? lastPage : currentPage + 1;
  const middlePage = Math.ceil(lastPage / 2);

  const filterBtns = filterKeys.map((key) =>
    Markup.callbackButton(
      objectReFilters[key].toLowerCase(),
      JSON.stringify({
        type: typesQuery.FILTER,
        value: objectReFilters[key],
      })
    )
  );

  const filterBtnsWithMark = switchBtns(filterBtns, filter);

  const paginationBtns = [
    {
      nameBtn: `<<`,
      pageNumber: prevPage,
    },
    {
      nameBtn: `>>`,
      pageNumber: nextPage,
    },
    {
      nameBtn: "в начало",
      pageNumber: firstPage,
    },

    {
      nameBtn: "в середину",
      pageNumber: middlePage,
    },

    {
      nameBtn: "в конец",
      pageNumber: lastPage,
    },
  ];

  const paginationKeyboard = paginationBtns.map((btn) =>
    Markup.callbackButton(
      btn.nameBtn,
      JSON.stringify({
        type: typesQuery.PAGINATION,
        page: btn.pageNumber,
      })
    )
  );

  const selectPageBtn = Markup.callbackButton(
    `${currentPage} / ${lastPage}`,
    JSON.stringify({ type: typesQuery.SELECT_OBJECT })
  );
  const mainMenuBtn = Markup.callbackButton(
    "🏠 Главное меню",
    JSON.stringify({ type: typesQuery.MAIN_MENU })
  );

  const findByPointBtn = Markup.callbackButton(
    "Поиск по №",
    JSON.stringify({
      type: typesQuery.FIND_BY_POINT,
    })
  );

  const arrowBtns = paginationKeyboard.splice(0, 2);
  arrowBtns.splice(1, 0, selectPageBtn);

  const limitBtns = numbersObjectReOnPage.map((number) =>
    Markup.callbackButton(
      `${number}`,
      JSON.stringify({
        type: typesQuery.LIMIT,
        value: number,
      })
    )
  );

  const limitBtnsWithMark = switchBtns(limitBtns, limit);

  return [
    arrowBtns,
    paginationKeyboard,
    filterBtnsWithMark,
    limitBtnsWithMark,
    [findByPointBtn, mainMenuBtn],
  ];
};

const getSkipValue = (currentPage, limit) => limit * (currentPage - 1);

const getObjectReList = async (filter, skip, limit) => {
  const filterDB = getFilterObject(filter);

  return ObjectRe.find(
    filterDB,
    "point objectReType totalArea address price isArchived",
    {
      skip: skip,
      limit: limit,
      sort: {
        date: -1,
      },
    }
  );
};

const createAllObjectResStr = async (filter, currentPage, limit) => {
  const skip = getSkipValue(currentPage, limit);
  const allObjectRes = await getObjectReList(filter, skip, limit);
  if (!allObjectRes.length) return "";

  let allObjectResStr = "",
    objectReIndex = skip + 1;

  for (const obj of allObjectRes) {
    const miniCaption = createMiniCaption(obj);

    allObjectResStr += `*${objectReIndex++})* ${miniCaption} \n\n`;
  }

  return allObjectResStr;
};

const allObjects = new Scene("step_object_list");

allObjects.start(async (ctx) => {
  await ctx.scene.enter("main_menu");
});

allObjects.enter(accessMainMenuMW, async (ctx) => {
  ctx.session.editObjectRe = {
    point: "",
    extra: "",
  };

  const options = await Options.findOne({}, "allObjects");

  const allObjectResStr = await createAllObjectResStr(
    options.allObjects.filter,
    options.allObjects.currentPage,
    options.allObjects.limit
  );
  const allObjectsKeyboard = await getAllObjectsKeyboard(
    options.allObjects.filter,
    options.allObjects.firstPage,
    options.allObjects.currentPage,
    options.allObjects.limit
  );

  return ctx.replyWithMarkdown(
    allObjectResStr,
    Markup.inlineKeyboard(allObjectsKeyboard).extra()
  );
});

allObjects.on("callback_query", checkJSONmw, async (ctx) => {
  const { type, page, point, value } = JSON.parse(ctx.callbackQuery.data);

  let allObjectsKeyboard, allObjectResStr, options;

  switch (type) {
    case typesQuery.FILTER:
      options = await Options.findOne({}, "allObjects");
      options.allObjects.currentPage = options.allObjects.firstPage;
      options.allObjects.filter = value;
      await options.save();

      allObjectResStr = await createAllObjectResStr(
        value,
        options.allObjects.currentPage,
        options.allObjects.limit
      );
      if (!allObjectResStr) return ctx.answerCbQuery(`Нет объектов!`);
      allObjectsKeyboard = await getAllObjectsKeyboard(
        value,
        options.allObjects.firstPage,
        options.allObjects.currentPage,
        options.allObjects.limit
      );

      await ctx.answerCbQuery(value);
      return ctx.editMessageText(
        allObjectResStr,
        Markup.inlineKeyboard(allObjectsKeyboard).extra({
          parse_mode: "Markdown",
        })
      );

    case typesQuery.PAGINATION:
      options = await Options.findOne({}, "allObjects");

      if (options.allObjects.currentPage === page)
        return ctx.answerCbQuery(page);

      options.allObjects.currentPage = page;
      await options.save();

      allObjectResStr = await createAllObjectResStr(
        options.allObjects.filter,
        page,
        options.allObjects.limit
      );
      allObjectsKeyboard = await getAllObjectsKeyboard(
        options.allObjects.filter,
        options.allObjects.firstPage,
        page,
        options.allObjects.limit
      );

      await ctx.answerCbQuery();
      return ctx.editMessageText(
        allObjectResStr,
        Markup.inlineKeyboard(allObjectsKeyboard).extra({
          parse_mode: "Markdown",
        })
      );

    case typesQuery.SELECT_OBJECT:
      options = await Options.findOne({}, "allObjects");

      const skip = getSkipValue(
        options.allObjects.currentPage,
        options.allObjects.limit
      );
      const objectResBD = await getObjectReList(
        options.allObjects.filter,
        skip,
        options.allObjects.limit
      );

      const objectResBtns = objectResBD.map((obj, i) =>
        Markup.callbackButton(
          skip + i + 1,
          JSON.stringify({
            type: typesQuery.OBJECT_RE,
            point: obj.point,
          })
        )
      );

      const objectResKeyboard = splitArray(objectResBtns);

      const backBtn = [
        Markup.callbackButton(
          "Назад",
          JSON.stringify({
            type: typesQuery.BACK,
          })
        ),
      ];

      objectResKeyboard.push(backBtn);

      await ctx.editMessageReplyMarkup(
        Markup.inlineKeyboard(objectResKeyboard, { columns: 5 })
      );
      return ctx.answerCbQuery();

    case typesQuery.LIMIT:
      options = await Options.findOne({}, "allObjects");
      if (options.allObjects.limit === value) return ctx.answerCbQuery(value);

      options.allObjects.currentPage = options.allObjects.firstPage;
      options.allObjects.limit = value;
      await options.save();

      allObjectResStr = await createAllObjectResStr(
        options.allObjects.filter,
        options.allObjects.currentPage,
        value
      );
      allObjectsKeyboard = await getAllObjectsKeyboard(
        options.allObjects.filter,
        options.allObjects.firstPage,
        options.allObjects.currentPage,
        value
      );

      await ctx.answerCbQuery(value);
      return ctx.editMessageText(
        allObjectResStr,
        Markup.inlineKeyboard(allObjectsKeyboard).extra({
          parse_mode: "Markdown",
        })
      );

    case typesQuery.OBJECT_RE:
      ctx.session.editObjectRe.point = point;

      await ctx.answerCbQuery();
      return ctx.scene.enter("step_edit_object_re");

    case typesQuery.FIND_BY_POINT:
      await ctx.answerCbQuery();
      return ctx.scene.enter("step_find_by_point");

    case typesQuery.BACK:
      options = await Options.findOne({}, "allObjects");

      allObjectsKeyboard = await getAllObjectsKeyboard(
        options.allObjects.filter,
        options.allObjects.firstPage,
        options.allObjects.currentPage,
        options.allObjects.limit
      );
      await ctx.editMessageReplyMarkup(
        Markup.inlineKeyboard(allObjectsKeyboard)
      );
      return ctx.answerCbQuery("Назад");

    case typesQuery.MAIN_MENU:
      await ctx.answerCbQuery();
      return ctx.scene.enter("main_menu");

    default:
      await ctx.replyWithMarkdown(
        `❗️ Используйте кнопки в меню _Все объекты_.`
      );
      break;
  }

  await ctx.answerCbQuery();
});

allObjects.use(async (ctx) => {
  await ctx.replyWithMarkdown(`❗️ Используйте кнопки в меню _Все объекты_.`);
});

module.exports = allObjects;

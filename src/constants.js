const typesQuery = {
  ADD_OBJECT: "ADD_OBJECT",
  ALL_OBJECTS: "ALL_OBJECTS",
  SELECT_OBJECT: "SELECT_OBJECT",
  PAGINATION: "PAGINATION",
  FIND_BY_POINT: "FIND_BY_POINT",
  OBJECT_RE: "OBJECT_RE",
  SETTINGS: "SETTINGS",
  DISTRICT: "DISTRICT",
  MORTGAGE: "MORTGAGE",
  LEAVE: "LEAVE",
  CONTINUE: "CONTINUE",
  MAIN_MENU: "MAIN_MENU",
  SEND: "SEND",
  BACK: "BACK",
  FILTER: "FILTER",
  LIMIT: "LIMIT",
  PUBLISH: "PUBLISH",
  PUBLISH_YES: "PUB_YES",
  EDIT_PRICE: "EDIT_PRICE",
  EDIT_EXTRA: "EDIT_EXTRA",
  EDIT_PHONE: "EDIT_PHONE",
  EDIT_MORTGAGE: "EDIT_MORTGAGE",
  ADD_TO_ARCHIVE: "ADD_TO_ARCHIVE",
  DELETE: "DELETE",
  DELETE_YES: "DEL_YES",
  APPLY_MORTGAGE: "APPLY_MORTGAGE",
  AGREEMENT: "AGREEMENT",
  EDIT_AUTOPOSTING: "EDIT_AUTOPOSTING",
  EDIT_CONTACT: "EDIT_CONTACT",
  EDIT_ADMINS: "EDIT_ADMINS",
  START_AUTOPOSTING: "START_AUTOPOSTING",
  PAUSE_AUTOPOSTING: "PAUSE_AUTOPOSTING",
  STOP_AUTOPOSTING: "STOP_AUTOPOSTING",
  EDIT_NAME_COMPANY: "EDIT_NAME_COMPANY",
  EDIT_EMAIL: "EDIT_EMAIL",
  ADD_PHONE: "ADD_PHONE",
  DELETE_PHONE: "DELETE_PHONE",
  DELETE_TIME: "DELETE_TIME",
  DELETE_ADMIN: "DELETE_ADMIN",
  NEXT_STEP: "NEXT_STEP",
  ACCEPT: "ACCEPT",
};

const objectReTypes = {
  apart: "Квартира",
  room: "Комната",
  house: "Дом",
  partOfHouse: "Часть дома",
  premises: "Помещение",
  townhouse: "Таунхаус",
  plot: "Участок",
  commercialRe: "Коммерческая недв-ть",
};

const markSymbol = "✅";

const markdownParseMode = { parse_mode: "Markdown" };

const autopostingStatuses = {
  start: {
    name: "start",
    text: "включен",
    emoji: "🟢",
  },
  pause: {
    name: "pause",
    text: "на паузе",
    emoji: "🟡",
  },
  stop: {
    name: "stop",
    text: "выключен",
    emoji: "🔴",
  },
};

const numberRoomTags = {
  1: "однушка",
  2: "двушка",
  3: "трешка",
  4: "4комнатная",
  5: "5комнатная",
  6: "6комнатная",
  7: "7комнатная",
  8: "8комнатная",
  9: "9комнатная",
  Студия: "студия",
};

const objectReFilters = {
  all: "Все",
  isActived: "Активные",
  isArchived: "В архиве",
};

const seniorityTypes = {
  stFirst: "Менее 3 мес",
  stSecond: "От 3 до 6 мес",
  stThird: "От 6 до 12 мес",
  stFourth: "Более 12 мес",
};

const numbersObjectReOnPage = [1, 3, 5, 7, 10];

const emptyPhrase = "не добавлено";

const textBlockLimits = {
  REAL_ESTATE: 20,
  TOTAL_AREA: 10,
  LIVING_AREA: 6,
  KITCHEN_AREA: 6,
  NUMBER_ROOMS: 14,
  FLOOR: 6,
  PRICE: 10,
  APART_EXTRA_SYMBOLS: 70,
  ADDRESS: 66,
  CONTACTS: 78,
  DISTRICT: 24,
  MORTGAGE_LINK: 26,
  POINT: 14,
  EXTRA_SYMBOLS_AND_SPACES: 12,
  EXTRA: 658,
  CAPTION: 1024,
};

module.exports = {
  typesQuery,
  objectReTypes,
  numberRoomTags,
  textBlockLimits,
  objectReFilters,
  seniorityTypes,
  emptyPhrase,
  markdownParseMode,
  numbersObjectReOnPage,
  markSymbol,
  autopostingStatuses,
};

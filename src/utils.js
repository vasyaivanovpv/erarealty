module.exports = {
  logStart: () => console.log("BOT HAS BEEN STARTED......"),

  debug: (obj = {}) => JSON.stringify(obj, null, 4),

  escapeRegExp: (str = "") =>
    `${str}`.replace(/[_*[\]()~`>#+-=|{}.!]/g, "\\$&"), // $& means the whole matched string
  escapeChar: (string = "") => `${string}`.replace(/[_*[`]/g, "\\$&"), // $& means the whole matched string
  isInteger: (num) =>
    (num ^ 0) === num && num > 0 && num !== Infinity && num !== -Infinity,
  toHashTag: (str) =>
    str
      .replace(/[-]/g, " ")
      .split(" ")
      .map((s) => s[0].toUpperCase() + s.slice(1))
      .join(""),
  toNumber: (str) => {
    const temp = str.split(",");
    if (temp.length > 1) {
      return +Number(temp.join(".")).toFixed(1);
    } else {
      return +Number(str).toFixed(1);
    }
  },
  validateTime: (time) => {
    const re = /^([01]{1}[0-9]|2[0-3]):[0-5][0-9]$/;
    return re.test(time);
  },
  validateEmail: (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  },
  convertToServerTime: (timeStr) => {
    const time = timeStr.split(":");
    const now = new Date();
    now.setHours(+time[0] - 3, 0);
    return `${now.getHours()}:${time[1]}`;
  },
  splitArray: (arr, perChunk = 5) => {
    let i, j, tempArr;
    const resultArr = [];
    for (i = 0, j = arr.length; i < j; i += perChunk) {
      tempArr = arr.slice(i, i + perChunk);
      resultArr.push(tempArr);
    }
    return resultArr;
  },
  toString: (number) => String(number).split(".").join(","),
  toPlural: (str) => `${str.slice(0, -1).toLowerCase()}ы`,
  getCountDaysFromNow: (date) =>
    +((new Date() - date) / 1000 / 60 / 60 / 24).toFixed(),
  isJSONString: (str) => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  },
  declOfNum: (n, titles) =>
    titles[
      n % 10 == 1 && n % 100 != 11
        ? 0
        : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)
        ? 1
        : 2
    ],
  increaseMonth: (now, num) =>
    new Date(
      now.getFullYear(),
      now.getMonth() + num,
      now.getDate(),
      now.getHours(),
      now.getMinutes()
    ),
  toStringDate: (date) =>
    [
      `${date.getDate()}`.padStart(2, "0"),
      `${date.getMonth() + 1}`.padStart(2, "0"),
      date.getFullYear(),
    ].join("."),
  sleep: (ms) => {
    return new Promise((r) => setTimeout(r, ms));
  },
  formatPrice: (price) => `${price}`.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1 "),
  isFloat: (n) => !!n && n > 0 && n !== Infinity && n !== -Infinity,
  getLocalTime: () => {
    const d = new Date();
    const options = {
      timeZone: "Europe/Moscow",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    };
    return d.toLocaleTimeString("ru-RU", options);
  },
};

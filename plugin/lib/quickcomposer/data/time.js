const time = {
  // 解析时间字符串或时间戳为 Date 对象
  _parseTime: function (time) {
    if (!time || time === "now") {
      return new Date();
    }
    if (typeof time === "number") {
      return new Date(time.toString().length === 10 ? time * 1000 : time);
    }
    return new Date(time);
  },

  // 格式化数字为两位数
  _pad: function (number) {
    return number.toString().padStart(2, "0");
  },

  // 格式化时间
  format: function (time, format) {
    const date = this._parseTime(time);
    if (!date.getTime()) return "";

    const year = date.getFullYear();
    const month = this._pad(date.getMonth() + 1);
    const day = this._pad(date.getDate());
    const hours = this._pad(date.getHours());
    const minutes = this._pad(date.getMinutes());
    const seconds = this._pad(date.getSeconds());

    switch (format) {
      case "YYYY-MM-DD":
        return `${year}-${month}-${day}`;
      case "YYYY-MM-DD HH:mm:ss":
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      case "YYYY年MM月DD日":
        return `${year}年${month}月${day}日`;
      case "MM/DD/YYYY":
        return `${month}/${day}/${year}`;
      case "DD/MM/YYYY":
        return `${day}/${month}/${year}`;
      case "HH:mm:ss":
        return `${hours}:${minutes}:${seconds}`;
      case "YYYY-MM-DD HH:mm":
        return `${year}-${month}-${day} ${hours}:${minutes}`;
      case "timestamp":
        return Math.floor(date.getTime() / 1000);
      case "timestamp_ms":
        return date.getTime();
      case "relative":
        return this._getRelativeTime(date);
      default:
        return date.toLocaleString();
    }
  },

  // 获取相对时间描述
  _getRelativeTime: function (date) {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return "刚刚";
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 30) return `${days}天前`;
    if (months < 12) return `${months}个月前`;
    return `${years}年前`;
  },

  // 解析时间
  parse: function (time, format) {
    if (!time) return null;

    // 处理时间戳
    if (format === "timestamp") {
      return new Date(Number(time) * 1000);
    }
    if (format === "timestamp_ms") {
      return new Date(Number(time));
    }

    // 处理标准格式
    const now = new Date();
    const year = now.getFullYear();
    let result;

    switch (format) {
      case "YYYY-MM-DD":
      case "YYYY-MM-DD HH:mm:ss":
      case "YYYY-MM-DD HH:mm":
        result = new Date(time);
        break;
      case "YYYY年MM月DD日":
        time = time.replace(/[年月日]/g, (match) => {
          return { 年: "-", 月: "-", 日: "" }[match];
        });
        result = new Date(time);
        break;
      case "MM/DD/YYYY":
        const [month, day, yyyy] = time.split("/");
        result = new Date(yyyy, month - 1, day);
        break;
      case "DD/MM/YYYY":
        const [dd, mm, yy] = time.split("/");
        result = new Date(yy, mm - 1, dd);
        break;
      default:
        result = new Date(time);
    }

    return result.getTime() ? result : null;
  },

  // 时间加减
  add: function (time, value, unit) {
    const date = this._parseTime(time);
    if (!date.getTime()) return null;

    const unitMap = {
      years: "FullYear",
      months: "Month",
      weeks: "Date",
      days: "Date",
      hours: "Hours",
      minutes: "Minutes",
      seconds: "Seconds",
    };

    const methodName = `set${unitMap[unit]}`;
    const getValue = `get${unitMap[unit]}`;

    if (unit === "weeks") {
      value *= 7;
    }

    date[methodName](date[getValue]() + value);
    return date;
  },

  // 时间差值
  diff: function (time1, time2, unit = "days", absolute = true) {
    const date1 = this._parseTime(time1);
    const date2 = this._parseTime(time2);

    if (!date1.getTime() || !date2.getTime()) return null;

    const milliseconds = date2 - date1;
    let result;

    switch (unit) {
      case "years":
        result = date2.getFullYear() - date1.getFullYear();
        break;
      case "months":
        result =
          (date2.getFullYear() - date1.getFullYear()) * 12 +
          (date2.getMonth() - date1.getMonth());
        break;
      case "weeks":
        result = milliseconds / (7 * 24 * 60 * 60 * 1000);
        break;
      case "days":
        result = milliseconds / (24 * 60 * 60 * 1000);
        break;
      case "hours":
        result = milliseconds / (60 * 60 * 1000);
        break;
      case "minutes":
        result = milliseconds / (60 * 1000);
        break;
      case "seconds":
        result = milliseconds / 1000;
        break;
      case "milliseconds":
        result = milliseconds;
        break;
      default:
        result = milliseconds / (24 * 60 * 60 * 1000);
    }

    return absolute ? Math.abs(result) : result;
  },

  // 时间边界
  startOf: function (time, unit, type = "start") {
    const date = this._parseTime(time);
    if (!date.getTime()) return null;

    const isEnd = type === "end";

    switch (unit) {
      case "year":
        date.setMonth(isEnd ? 11 : 0, 1);
        date.setHours(
          isEnd ? 23 : 0,
          isEnd ? 59 : 0,
          isEnd ? 59 : 0,
          isEnd ? 999 : 0
        );
        break;
      case "month":
        date.setDate(1);
        if (isEnd) {
          date.setMonth(date.getMonth() + 1, 0);
          date.setHours(23, 59, 59, 999);
        } else {
          date.setHours(0, 0, 0, 0);
        }
        break;
      case "week":
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        date.setDate(diff);
        if (isEnd) {
          date.setDate(date.getDate() + 6);
          date.setHours(23, 59, 59, 999);
        } else {
          date.setHours(0, 0, 0, 0);
        }
        break;
      case "day":
        date.setHours(
          isEnd ? 23 : 0,
          isEnd ? 59 : 0,
          isEnd ? 59 : 0,
          isEnd ? 999 : 0
        );
        break;
      case "hour":
        date.setMinutes(isEnd ? 59 : 0, isEnd ? 59 : 0, isEnd ? 999 : 0);
        break;
      case "minute":
        date.setSeconds(isEnd ? 59 : 0, isEnd ? 999 : 0);
        break;
      case "second":
        date.setMilliseconds(isEnd ? 999 : 0);
        break;
    }

    return date;
  },

  // 时间验证
  isValid: function (time, format) {
    if (!time) return false;
    const date = this.parse(time, format);
    return date && date.getTime() > 0;
  },

  // 日历信息
  calendar: function (time) {
    const date = this._parseTime(time);
    if (!date.getTime()) return null;

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const week = date.getDay();
    const weekText = ["日", "一", "二", "三", "四", "五", "六"][week];

    // 星座计算
    const constellation = this._getConstellation(month, day);

    return {
      year,
      month,
      day,
      week,
      weekText: `星期${weekText}`,
      constellation,
      isWeekend: week === 0 || week === 6,
      isLeapYear: (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0,
      daysInMonth: new Date(year, month, 0).getDate(),
      timestamp: Math.floor(date.getTime() / 1000),
      timestamp_ms: date.getTime(),
    };
  },

  // 获取星座
  _getConstellation: function (month, day) {
    const constellations = [
      "魔羯",
      "水瓶",
      "双鱼",
      "白羊",
      "金牛",
      "双子",
      "巨蟹",
      "狮子",
      "处女",
      "天秤",
      "天蝎",
      "射手",
      "魔羯",
    ];
    const dates = [20, 19, 21, 20, 21, 22, 23, 23, 23, 24, 23, 22];
    return day < dates[month - 1]
      ? constellations[month - 1]
      : constellations[month];
  },

  // 工作日计算
  workday: function (startTime, days, weekends = false, holidays = []) {
    const date = this._parseTime(startTime);
    if (!date.getTime()) return null;

    let currentDate = new Date(date);
    let remainingDays = Math.abs(days);
    const direction = days >= 0 ? 1 : -1;
    const holidaySet = new Set(
      holidays.map((h) => this.format(h, "YYYY-MM-DD"))
    );

    while (remainingDays > 0) {
      currentDate.setDate(currentDate.getDate() + direction);
      const isWeekend =
        currentDate.getDay() === 0 || currentDate.getDay() === 6;
      const isHoliday = holidaySet.has(this.format(currentDate, "YYYY-MM-DD"));

      if ((!isWeekend || weekends) && !isHoliday) {
        remainingDays--;
      }
    }

    return currentDate;
  },

  // 时间范围判断
  between: function (time, startTime, endTime, inclusive = true) {
    const date = this._parseTime(time);
    const start = this._parseTime(startTime);
    const end = this._parseTime(endTime);

    if (!date.getTime() || !start.getTime() || !end.getTime()) {
      return false;
    }

    if (inclusive) {
      return date >= start && date <= end;
    }
    return date > start && date < end;
  },
};

module.exports = time;

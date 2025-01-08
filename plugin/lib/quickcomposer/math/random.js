const randomInt = (start, end) => {
  return Math.round(Math.random() * (end - start) + start);
};

const random = (isInt = false, start, end) => {
  if (!start && !end) {
    return isInt ? randomInt(0, 1000000) : Math.random();
  }

  if (!end) {
    end = Math.abs(randomInt(0, 1000000) - start);
  }

  if (!start) {
    start = 0;
  }

  // 有start和end：返回区间随机数
  const random = Math.random() * (end - start) + start;
  return isInt ? Math.round(random) : random;
};

module.exports = random;

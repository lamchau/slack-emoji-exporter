const pad = (value, length = 2, padding = '0') => {
  str = String(value);
  for (let i = 0; i < length && str.length < length; i++) {
    str = `${padding}${str}`;
  }
  return str;
}

const getTimezoneOffset = (offset = new Date().getTimezoneOffset()) => {
  offset = offset || 0;
  const sign = offset > 0 ? '+' : '-';
  const hours = Math.floor(Math.abs(offset / 60));
  const minutes = Math.abs(offset % 60);

  return `${sign}${pad(hours)}:${pad(minutes)}`;
};

const getISOString = (date = new Date(), utc = false) => {
  if (utc) {
    return new Date().toISOString();
  }
  const {
    day,
    month,
    year,
    hours,
    minutes,
    seconds,
    milliseconds
  } = parseDate(date);
  const timezone = `${getTimezoneOffset(date.getTimezoneOffset())}`;
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${timezone}`;
};

const parseDate = date => {
  return {
    day: pad(date.getDate()),
    month: pad(date.getMonth() + 1),
    year: pad(date.getFullYear()),
    hours: pad(date.getHours()),
    minutes: pad(date.getMinutes()),
    seconds: pad(date.getSeconds()),
    milliseconds: pad(date.getMilliseconds(), 3)
  };
}

module.exports = {
  parseDate,
  getISOString,
  getTimezoneOffset,
};

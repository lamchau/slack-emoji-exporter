const path = require('path');
const winston = require('winston');
const options = require('./options');

const { parseDate, getTimezoneOffset } = require('./time');

const createFormat = () => {
  const printer = winston.format.printf(({ level, message, label, timestamp }) => {
    label = label || 'default';
    level = level.toUpperCase();
    return `${timestamp} - [${label}] ${level} - ${message}`;
  });
  return winston.format.combine(
    winston.format.timestamp({
      format: `YYYY-MM-DD'T'HH:mm:ss.SSS${getTimezoneOffset()}`
    }),
    printer
  );
};

const getFilename = filename => {
  const { year, month, day } = parseDate(new Date());
  const extension = path.extname(filename);
  const basename = path.basename(filename, extension);

  const date = `${year}-${month}-${day}`;
  return `${date}__${basename}${extension}`;
};

const DEFAULT_LOGGER_OPTIONS = {
  format: createFormat(),
  handleExceptions: true
};

module.exports = new winston.createLogger({
  transports: [
    new winston.transports.Console({
      ...DEFAULT_LOGGER_OPTIONS,
      level: 'silly'
    }),
    new winston.transports.File({
      ...DEFAULT_LOGGER_OPTIONS,
      filename: getFilename('debug.log'),
      level: 'debug'
    })
  ]
});

const fs = require('fs');
const path = require('path');
const commander = require('commander');

const DEFAULTS = Object.freeze({
  LIMIT: 10,
  OVERWRITE: false,
  OUTPUT_DIRECTORY: path.join(__dirname, 'images')
});

function getConcurrentLimit(limit) {
  const value = parseInt(limit) || DEFAULTS.LIMIT;
  return Math.min(Math.max(value, 1), DEFAULTS.LIMIT);
}

function getOutputDirectory(dir) {
  const target = path.resolve(dir);
  if (!fs.existsSync(target)) {
    console.log(`creating directory ${target}`);
    fs.mkdirSync(target);
  }
  return target;
}

function getSlackToken(token) {
  if (String(token).startsWith('xoxp')) {
    return token;
  }
  console.error(
    `Invalid slack API token '${token}', token must start with "xoxp".\n` +
    `See https://api.slack.com/docs/token-types#user`
  );
  process.exit(1);
}

commander
  .option('--debug', 'debug with a small number of exports')
  .option('--limit [value]', 'number of concurrent promises', DEFAULTS.LIMIT)
  .option('--token <token>', 'slack user token')
  .option('--overwrite', 'overwrite existing files', DEFAULTS.OVERWRITE)
  .option('--output [directory]', 'download directory', DEFAULTS.OUTPUT_DIRECTORY);

module.exports = Object.freeze({
  parse() {
    commander.parse(...arguments);

    // https://github.com/tj/commander.js/issues/44
    commander.limit = getConcurrentLimit(commander.limit);
    commander.output = getOutputDirectory(commander.output);
    commander.token = getSlackToken(commander.token);
  },
  get debug() {
    return Boolean(commander.debug);
  },
  get limit() {
    return commander.limit;
  },
  get output() {
    return commander.output;
  },
  get overwrite() {
    // https://github.com/tj/commander.js/issues/574
    return Boolean(commander.overwrite);
  },
  get token() {
    return commander.token;
  }
});

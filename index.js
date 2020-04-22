#!/usr/bin/env node

// must be first
const options = require('./options');
options.parse(process.argv);
const logger = require('./logger');

// native libraries
const fs = require('fs');
const path = require('path');
const util = require('util');
const stat = util.promisify(fs.stat);

// 3p libraries
const axios = require('axios');

const { TaskQueue } = require('cwait');
const MAX_SIMULTANEOUS_DOWNLOADS = options.limit;

const { WebClient } = require('@slack/web-api');
const web = new WebClient(options.token);

// contains token, don't persist to file
logger.silly(`cli options: ${JSON.stringify(options, null, 2)}`);

function createIterable(obj) {
  return {
    ...obj,
    [Symbol.iterator]: function* () {
      for (let key in this) {
        yield [key, this[key]];
      }
    }
  };
}

async function createWriteStream(path) {
  return new Promise(resolve => {
    return stat(path, (error, stats) => {
      const fileExists = error === null;
      const canWrite = options.overwrite ? options.overwrite : !fileExists;
      if (canWrite) {
        const writerOptions = options.overwrite ? { flags: 'w' } : {};
        const writer = fs.createWriteStream(path, writerOptions);
        resolve(writer);
      } else {
        const message = { message: `file exists '${path}'` };
        logger.warn(message);
      }
    });
  });
}

async function get(url) {
  const config = {
    url,
    method: 'GET',
    responseType: 'stream'
  };

  return axios(config)
    .then(response => {
      if (response.data.statusCode === 200) {
        logger.debug({ message: `${config.method} ${config.url}`, label: 'axios' });
        return response;
      }
    })
    .catch(error => {
      const message = `failed to fetch '${url} (${error})`;
      logger.error({ message });
      throw new Error(message);
    });
}

async function saveImageToDisk(url) {
  // extract slackmoji from URL
  const { dir, ext } = path.parse(url);
  const filename = path.basename(dir) + ext;
  const filepath = `${options.output}/${filename}`;

  const response = await get(url);
  const writer = await createWriteStream(filepath);

  logger.debug(`creating file writer '${filename}'`);
  if (writer) {
    return new Promise((resolve, reject) => {
      response.data
        .pipe(writer)
        .on('close', () => {
          logger.debug(`saved '${filepath}'`);
          resolve();
        })
        .on('error', e => reject({ message: e, url, filepath }));
    });
  }
  logger.warn(`failed to create file writer '${filename}'`);
  return Promise.reject({ url, filepath });
}

(async() => {
  const queue = new TaskQueue(Promise, MAX_SIMULTANEOUS_DOWNLOADS);
  const response = await web.emoji.list();
  const emoji = createIterable(response.emoji);
  const emojiCount = Object.keys(emoji).length;

  const aliased = {};
  for (const [name, url] of emoji) {
    if (url.startsWith('alias:')) {
      aliased[url] = name;
      logger.warn({ label: 'main', message: `manually add alias '${url.split(':')[1]}' -> '${name}'` });
      delete emoji[name];
    }
  }

  const urls = options.debug ?
    Object.values(emoji).slice(0, Math.min(emojiCount, 10)) :
    Object.values(emoji);
  logger.info({ label: 'main', message: `found ${urls.length} emoji, ${Object.keys(aliased).length} aliases.` });
  const tasks = urls.map(queue.wrap(saveImageToDisk));

  Promise.all(tasks)
    .then((resolved, reject) => {
      if (reject) {
        logger.error(reject);
      }
      return resolved;
    })
    .catch(e => logger.error({ label: 'main', message: e.message }));
  process.on('exit', () => {
    logger.info('backup complete');
  });
})();

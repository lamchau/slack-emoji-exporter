const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { TaskQueue } = require('cwait');

const TARGET_DIRECTORY = './images';
const TOKEN = process.env.SLACK_TOKEN;
const MAX_SIMULTANEOUS_DOWNLOADS = 10;
const FORCE_OVERWRITE = false;

const { WebClient } = require('@slack/web-api');
const web = new WebClient(TOKEN);

const util = require('util');
const stat = util.promisify(fs.stat);

if (!fs.existsSync(TARGET_DIRECTORY)){
  fs.mkdirSync(TARGET_DIRECTORY);
}

function createIterable(obj) {
  return {
    ...obj,
    [Symbol.iterator]: function* () {
      for (let key in this) {
        yield [key, this[key]]
      }
    }
  }
}

async function createWriteStream(path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (error, stats) => {
      const exists = stats && (stats.isFile() || stats.isDirectory());
      if (FORCE_OVERWRITE || !exists) {
        const options = FORCE_OVERWRITE ? { flags: 'w' } : {};
        const writer = fs.createWriteStream(path, options);
        resolve(writer);
      } else {
        reject({ message: `Skipping: '${path}', file/directory already exists` });
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
    .catch(error => {
      throw new Error(`Failed to fetch '${url} (${error})`);
    });
}

async function saveImageToDisk(url) {
  // extract slackmoji from URL
  const { dir, ext } = path.parse(url);
  const filename = path.basename(dir) + ext;
  const filepath = `${TARGET_DIRECTORY}/${filename}`;

  const response = await get(url);
  const writer = await createWriteStream(filepath);

  if (writer) {
    return new Promise((resolve, reject) => {
      response.data
        .pipe(writer)
        .on('close', () => {
          // console.log(`Saved: ${filename}`);
          resolve({ url, filepath });
        })
        .on('error', e => reject({ message: e, url, filepath }))
    });
  }
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
      console.log(`manually add alias: ${url.split(':')[1]} -> ${name}`);
      delete emoji[name];
    }
  }

  const urls = Object.values(emoji);
  const tasks = urls.map(queue.wrap(saveImageToDisk));

  console.log(`Found ${urls.length} emoji, ${Object.keys(aliased).length} aliases.`);
  Promise.all(tasks)
    .then((resolved, reject) => {
      console.log(`Downloaded: ${resolved.length}/${emojiCount}`);
      console.log(reject);
    })
    .catch(e => console.error(e.message));
})();

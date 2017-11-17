const path = require('path');
const got = require('got');
const fs = require('fs-extra');
const Parser = require('./modules/Parser');

const parser = new Parser();
const url = process.env.URL || 'https://github.com/vuejs/awesome-vue';
const category = process.env.CATEGORY || 'vue';

(async () => {
  try {
    const response = await got(url);
    const html = response.body;

    parser.loadHtml(html);
    parser.getItems().then((items) => {
      const file = path.join(__dirname, `/docs/json/${category}/data.json`);

      fs.outputJson(file, items, { spaces: 2 }, error => {
        if (error) {
          console.log(error);
        }
      });
    });
  } catch (error) {
    console.log(error.response.body);
  }
})();
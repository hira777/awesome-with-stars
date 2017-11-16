const path = require('path');
const request = require('request');
const fs = require('fs-extra');
const Parser = require('./modules/Parser');

const parser = new Parser();
const url = process.env.URL || 'https://github.com/vuejs/awesome-vue';
const category = process.env.CATEGORY || 'vue';

request(url, (error, response, html) => {
  if (error) {
    console.error('error:', err);
  }

  parser.loadHtml(html);
  parser.getItems().then((items) => {
    const file = path.join(__dirname, `/docs/json/${category}/data.json`);

    fs.outputJson(file, items, { spaces: 2 }, error => {
      if (error) {
        console.log(error);
      }
    });
  });
});
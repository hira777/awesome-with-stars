const path = require('path');
const got = require('got');
const fs = require('fs-extra');
const _ = require('lodash');
const Parser = require('./modules/Parser');
const Request = require('./modules/Request');

const parser = new Parser();
const url = process.env.URL || 'https://github.com/vuejs/awesome-vue';
const category = process.env.CATEGORY || 'vue';

const onLoadHtml = async (html) => {
  parser.loadHtml(html);

  const itemsSelector = parser.filerByUrl({
    selector: '.markdown-body ul > li > a[href*="github.com"]',
    re: /github.com\/([^\/]+)\/([^\/]+)\/?/,
  });
  const texts = parser.getTextsFromSelectors({ selectors: itemsSelector });
  const urls = parser.getUrlFromSelectors({ selectors: itemsSelector });
  const htmls = await Request.fetchUrls({
    urls,
    sleep: 3000,
  });

  let descriptions = [];
  let stars = [];
  htmls.forEach((html) => {
    const $ = Parser.get$(html);

    descriptions.push(parser.getTextFromSelector({
      $,
      selector: '.repository-meta-content > [itemprop="about"]',
    }));

    stars.push(
      Number(
        parser.getTextFromSelector({
          $,
          selector: 'a[href*="stargazers"]',
        }).replace(',', '')
      )
    );
  });

  let items = _.zipWith(texts, urls, descriptions, stars, (text, url, description, star) => {
    return {
      text,
      url,
      description,
      star
    };
  });
  items = _.sortBy(items, ['star']).reverse()

  const file = path.join(__dirname, `/docs/json/${category}/data.json`);

  fs.outputJson(file, items, { spaces: 2 }, error => {
    if (error) {
      console.log(error);
    }
  });
};

(async () => {
  try {
    const response = await got(url);
    return onLoadHtml(response.body);
  } catch (error) {
    console.log(error.response.body);
  }
})();
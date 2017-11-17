const got = require('got');
const cheerio = require('cheerio');
const _ = require('lodash');

class Parser {

  constructor() {
    this.$ = null;
  }

  loadHtml(html) {
    this.$ = cheerio.load(html);
  }

  async getItems() {
    const itemsSelector = this.$('a[href*="github.com"]', '.markdown-body ul > li > ').filter((i, el) => {
      const url = this.$(el).attr('href');
      const re = /github.com\/([^\/]+)\/([^\/]+)\/?/;
      const matches = url.match(re);
      return (matches && matches.length > 2);
    });
    const texts = this.getTextsFromSelectors({ selectors: itemsSelector });
    const urls = this.getUrlFromSelectors({ selectors: itemsSelector });

    const htmls = await this.fetchHtmls({ selectors: itemsSelector });
    let descriptions = [];
    let stars = [];
    htmls.forEach((html) => {
      descriptions.push(this.getTextFromSelector({
        $: cheerio.load(html),
        selector: '.repository-meta-content > [itemprop="about"]',
      }));

      stars.push(
        Number(
          this.getTextFromSelector({
            $: cheerio.load(html),
            selector: 'a[href*="stargazers"]',
          }).replace(',', '')
        )
      );
    });

    const items = _.zipWith(texts, urls, descriptions, stars, (text, url, description, star) => {
      return {
        text,
        url,
        description,
        star
      };
    });

    return {
      items: _.sortBy(items, ['star']).reverse()
    };
  }

  /**
   * セレクタから取得したテキストを配列に格納して返す
   *
   * @param $
   * @param selectors
   * @returns {Object}
   */
  getTextFromSelector({ $ = this.$, selector }) {
    return $(selector).eq(0).text().trim();
  }

  /**
   * 複数のセレクタから取得したテキストを配列に格納して返す
   *
   * @param $
   * @param selectors
   * @returns {Array}
   */
  getTextsFromSelectors({ $ = this.$, selectors }) {
    return selectors.map((i, selector) => $(selector).text()).get();
  }

  /**
   * 複数のセレクタから取得したURLを配列に格納して返す
   *
   * @param $
   * @param selectors
   * @returns {Array}
   */
  getUrlFromSelectors({ $ = this.$, selectors }) {
    return selectors.map((i, selector) => $(selector).attr('href')).get();
  }

  /**
   * 複数のリクエスト先からhtmlを取得し、配列に格納する
   *
   * @param selectors
   * @return {Promise.<Array>}
   */
  async fetchHtmls({ selectors }) {
    let htmls = [];

    // eachだとawaitが利用できないため、for文で回す
    for (let i = 0; i < selectors.length; i += 1) {
      console.log(`${i}/${selectors.length}`);
      const url = this.$(selectors[i]).attr('href');
      const html = await this.fetchHtml({ url });
      htmls.push(html);
    }

    return htmls;
  }

  /**
   * リクエスト先からhtmlを取得する
   *
   * @param url
   * @return {Promise.<String>}
   */
  fetchHtml({ url }) {
    return new Promise(resolve => {
      setTimeout(() => {
        (async () => {
          try {
            const response = await got(url);
            const html = response.body;
            resolve(html);
          } catch (error) {
            console.log(error.response.body);
          }
        })();
      }, 500);
    });
  }

}

module.exports = Parser;

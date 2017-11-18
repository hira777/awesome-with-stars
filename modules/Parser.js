const cheerio = require('cheerio');
const _ = require('lodash');
const Request = require('./Request');

class Parser {

  constructor() {
    this.$ = null;
    this.request = new Request();
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
    let urls = this.getUrlFromSelectors({ selectors: itemsSelector });

    const htmls = await this.request.fetchUrls({
      urls,
      sleep: 1000,
    });
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

}

module.exports = Parser;

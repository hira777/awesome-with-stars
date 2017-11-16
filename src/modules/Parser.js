const request = require('request');
const cheerio = require('cheerio');
const zipWith = require('lodash.zipwith');

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
    const texts = this.getTextFromSelectors({ selectors: itemsSelector });
    const urls = this.getUrlFromSelectors({ selectors: itemsSelector });
    const stars = await this.fetchStarsFromRequestHtml({
      selector: itemsSelector,
      selectorWithStar: 'a[href*="stargazers"]'
    });
    const items = zipWith(texts, urls, stars, (text, url, star) => {
      return {
        text,
        url,
        star
      };
    });
  }

  /**
   * セレクタから取得したテキストを配列に格納して返す
   *
   * @param selectors
   * @returns {Array}
   */
  getTextFromSelectors({ selectors }) {
    return selectors.map((i, selector) => this.$(selector).text()).get();
  }

  /**
   * セレクタから取得したURLを配列に格納して返す
   *
   * @param selectors
   * @returns {Array}
   */
  getUrlFromSelectors({ selectors }) {
    return selectors.map((i, selector) => this.$(selector).attr('href')).get();
  }

  /**
   * hrefのURLのリクエスト先からスター数を取得し、配列で返す
   *
   * @param selector hrefからリンクを取得したいセレクタ
   * @param selectorWithStars スター数を取得したいセレクタ
   * @returns {Promise.<Array>}
   */
  async fetchStarsFromRequestHtml({ selector, selectorWithStar }) {
    let stars = [];

    for (let i = 0; i < selector.length; i += 1) {
      const url = this.$(selector[i]).attr('href');
      const star = await this.fetchStar({
        url,
        selectorWithStar
      });
      stars.push(star);
    }

    return stars;
  }

  /**
   * urlをリクエストして、返ってきたHTMLからスター数を取得する
   *
   * @param url リクエストするurl
   * @param selectorWithStars スター数を取得したいセレクタ
   * @returns {Promise}
   */
  fetchStar({ url, selectorWithStar }) {
    return new Promise(resolve => {
      request(url, (error, response, html) => {
        if (error) {
          console.error('error:', error);
        }

        const $ = cheerio.load(html);
        const star = $(selectorWithStar).eq(0).text().trim();
        resolve(star);
      });
    });
  }

}

module.exports = Parser;

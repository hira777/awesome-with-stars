const cheerio = require('cheerio');

class Parser {

  constructor() {
    this.$ = null;
  }

  loadHtml(html) {
    this.$ = cheerio.load(html);
  }

  static get$(html) {
    return cheerio.load(html);
  }

  /**
   * セレクタから取得したテキストを配列に格納して返す
   * @param $
   * @param selectors
   * @returns {Object}
   */
  getTextFromSelector({ $ = this.$, selector }) {
    return $(selector).eq(0).text().trim();
  }

  /**
   * 複数のセレクタから取得したテキストを配列に格納して返す
   * @param $
   * @param selectors
   * @returns {Array}
   */
  getTextsFromSelectors({ $ = this.$, selectors }) {
    return selectors.map((i, selector) => $(selector).text()).get();
  }

  /**
   * 複数のセレクタから取得したURLを配列に格納して返す
   * @param $
   * @param selectors
   * @returns {Array}
   */
  getUrlFromSelectors({ $ = this.$, selectors }) {
    return selectors.map((i, selector) => $(selector).attr('href')).get();
  }

  /**
   * 特定URLを含むセレクタを返す
   * @param $
   * @param selector
   * @param re
   */
  filerByUrl({ $ = this.$, selector, re }) {
    return $(selector).filter((i, el) => {
      const url = $(el).attr('href');
      const matches = url.match(re);
      return (matches && matches.length > 2);
    });
  }

}

module.exports = Parser;

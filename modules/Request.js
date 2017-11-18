const got = require('got');
const timeout = ms => new Promise(res => setTimeout(res, ms));

class Request {
  /**
   * 複数のリクエスト先からResponseBodyを取得する
   * @param urls {Array}
   * @param sleep {Number}
   * @return {Promise.<Array>}
   */
  static async fetchUrls({ urls, sleep = 0 }) {
    let responseBodies = [];

    for (let i = 0; i < urls.length; i += 1) {
      console.log(`${i} / ${urls.length}`);
      await timeout(sleep);
      const responseBody = await this.fetch({ url: urls[i] });
      responseBodies.push(responseBody);
    }

    return responseBodies;
  }

  /**
   * リクエスト先からResponseBodyを取得する
   * @param url {String}
   * @return {Promise.<String>}
   */
  static async fetch({ url }) {
    try {
      const response = await got(url);
      return response.body;
    } catch (error) {
      console.log(error.response.body);
    }
  }

}

module.exports = Request;

const got = require('got');

class Request {

  constructor() {
  }

  /**
   * 複数のリクエスト先からResponseオブジェクトを取得する
   *
   * @param selectors
   * @return {Promise.<Array>}
   */
  async fetchFromUrls({ urls }) {
    let responseBodies = [];

    for (let i = 0; i < urls.length; i += 1) {
      console.log(`${i} / ${urls.length}`);
      const responseBody = await this.fetch({ url: urls[i] });
      responseBodies.push(responseBody);
    }

    return responseBodies;
  }

  /**
   * リクエスト先からResponseオブジェクトを取得する
   * @param url
   * @return {Promise.<Object>}
   */
  fetch({ url }) {
    return new Promise(resolve => {
      setTimeout(() => {
        (async () => {
          try {
            const response = await got(url);
            resolve(response.body);
          } catch (error) {
            console.log(error.response.body);
          }
        })();
      }, 500);
    });
  }

}

module.exports = Request;

const EventEmitter = require('events').EventEmitter;
const request = require('request');
const Parser = require('./src/modules/Parser');

const emitter = new EventEmitter();
const parser = new Parser();

request('https://github.com/vuejs/awesome-vue', (error, response, html) => {
  if (error) {
    console.error('error:', err);
  }

  emitter.emit('requestAwesome', html);
});

emitter.on('requestAwesome', (html) => {
  parser.loadHtml(html);
  parser.getItems();
});
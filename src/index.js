import Vue from 'vue';
import request from 'superagent';

new Vue({
  el: '#app',
  data() {
    return {
      items: [],
    };
  },

  created() {
    request
      .get('./json/vue/data.json')
      .end((err, res) => {
        this.$data.items = res.body.items;
      });
  },
});

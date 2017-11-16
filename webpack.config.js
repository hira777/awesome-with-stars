const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: {
    index: './src/index.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.join(__dirname, './docs/js/'),
    publicPath: '/js/',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['env']
        }
      }
    ]
  },
  resolve: {
    alias: {
      vue: 'vue/dist/vue.js',
    }
  },
};

if (process.env.NODE_ENV === 'production') {
  module.exports.plugins = [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"',
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        drop_console: true
      },
    }),
  ]
} else {
  module.exports.devtool = '#source-map';
}
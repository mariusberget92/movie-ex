// Require our stuff
const path = require('path');
const merge = require('webpack-merge');
const base = require('./webpack.base.config');

// Build path (dist folder)
const buildPath = path.resolve(__dirname, './dist');

// We merge the base configration with this one
const main = merge(base, {

  // Src file
  entry: './src/main.js',

  // Output file (dist/main.js)
  output: {
    filename: 'main.js',
    path: buildPath
  }, 

  // Optimizations
  optimization: {
    minimize: false
  },
  
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
    ]
  },

  // Polyfills
  node: {
    __dirname: true,
    __filename: false
  },

  // Target
  target: 'electron-main'

});

module.exports = main;

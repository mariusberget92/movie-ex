const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

const config = {
  mode: 'production',  
  plugins: [
    /*new UglifyJsPlugin({
      test: /\.js($|\?)/i,
      sourceMap: true,
      uglifyOptions: {
        compress: true
      }
    })*/
  ]
};

module.exports = config;

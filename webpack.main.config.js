const rules = require('./webpack.rules');
const CopyPlugin = require("copy-webpack-plugin");

rules.push({
  test: /\.(png|jpg|gif)$/,
  type: 'asset/resource'
});

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main.js',
  // Put your normal webpack config below here
  module: {
    rules: require('./webpack.rules'),
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'node_modules/electron-preferences/build', to: 'native_modules' }
      ]
    }),
  ]
};

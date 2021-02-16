const HtmlWebpackPlugin = require('html-webpack-plugin'); //installed via npm
const WebpackCleanupPlugin = require('webpack-cleanup-plugin')
const baseConfig = require("leet-mvc/webpack.base.config");
const merge = require("webpack-merge");
const path = require('path');
const webpack = require ("webpack")

module.exports = (env) => {
  console.log(env)
  var mode = (env && env.production) ? "production" : 'development';
  var plugins = [];

  if (mode === "production") {
    //plugins.push(new WebpackCleanupPlugin(['www']));
  }

  plugins.push(new HtmlWebpackPlugin({ template: './src/index.html' }));
  plugins.push(new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('development')
  }))

  var out = baseConfig(
    {
      entry: ['./src/index.js'],
      devServer: {
        contentBase: path.join(__dirname, 'www'),
      },
      output: {
        path: path.resolve(__dirname, 'www')
      },
      mode: mode,
      plugins: plugins
    }
  );

  console.log(out);
  return out;
};

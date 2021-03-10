const TerserPlugin = require("terser-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin'); //installed via npm
const CopyWebpackPlugin = require('copy-webpack-plugin');
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
    var copyWebpackConfig = [];
    copyWebpackConfig.push({ from: 'static', to: '' });

    //plugins.push(new WebpackCleanupPlugin(['www']));
    //plugins.push(new CopyWebpackPlugin({patterns:copyWebpackConfig}));
  }

  
  plugins.push(new HtmlWebpackPlugin({ template: './src/index.html' }));
  plugins.push(new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('development')
  }))

  var out = baseConfig(
    {
      entry: ['./src/index.js'],
      devServer: {
        contentBase: path.join(__dirname, 'static'),
      },
      optimization: (mode=="production" ? {
        minimize: true,
        minimizer: [new TerserPlugin({
          terserOptions: {
            keep_classnames: true,
            keep_fnames: true
          },
        })],
      } : {}),
      output: {
        path: path.resolve(__dirname, 'www'),
        publicPath: mode != "production" ? '/' : 'https://snapwebapps.com/uccnceditor/',
      },
      mode: mode,
      plugins: plugins,
      module:{
        rules:[
          {
            // Include ts
            test: /\.ts$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
          },
        ]
      }
    }
  );

  console.log(out);
  return out;
};

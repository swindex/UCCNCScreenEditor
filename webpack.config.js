const TerserPlugin = require("terser-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin'); //installed via npm
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackCleanupPlugin = require('webpack-cleanup-plugin')
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

  var out = {
      entry: ['./src/index.js'],
      devtool: mode != "production" ? "inline-source-map" : false,
      devServer: {
        port: 9000,
        contentBase: path.join(__dirname, 'static'),
        disableHostCheck: true
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
      resolve: {
        extensions: ['.ts', '.js', '.json'],
        alias: {
          src: path.resolve(__dirname, 'src'),
        }
      },
      output: {
        path: path.resolve(__dirname, 'www'),
        library: "source", //this is added to the sourcemap paths
        publicPath: mode != "production" ? '/' : 'https://snapwebapps.com/uccnceditor/',
      },
      mode: mode,
      plugins: plugins,
      module:{
      rules:[
        /*{
          test: /\.js$/,
          exclude: /@babel(?:\/|\\{1,2})runtime|core-js/,
          loader: 'babel-loader',
        },*/
        {
          // Include ts
          test: /\.ts$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
        },
          /*{
            test: /\.js$/,
            exclude: /@babel(?:\/|\\{1,2})runtime|core-js/,
            loader: 'babel-loader',
          },*/
          {
            test: /\.html$/,
            use: [
              {
                loader: 'raw-loader',
              },
            ],
          },
          { test: /\.(jpg|png|gif)$/, loader: "file-loader", options: { name: '[name].[ext]', outputPath: 'img/' } },
          {
            test: /\.s[ac]ss$/i,
            use: [
              // Creates `style` nodes from JS strings
              "style-loader",
              // Translates CSS into CommonJS
              "css-loader",
              // Compiles Sass to CSS
              "sass-loader",
            ],
          },
          { test: /\.(woff|woff2|eot|ttf|svg)$/, loader: 'file-loader', options: { name: '[name].[ext]', outputPath: 'fonts/' } },
        ]
      }
    }

  //console.log(out);
  return out;
};

const HtmlWebpackPlugin = require('html-webpack-plugin'); //installed via npm

const baseConf = require('leet-mvc/webpack.base.config');
const {merge} = require('webpack-merge');
const webpack = require('webpack')

const path = require('path');


module.exports = (env) => {
  console.log(env)
  var production = env.production
  var plugins = [];
 
  plugins.push(new HtmlWebpackPlugin({ template: './src/index.html' }));
  plugins.push(new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('development')
  }))

  const conf = {
    plugins,
    mode: production ? 'production' : 'development',
    output: {
      path: path.resolve(__dirname, 'www')
    },
    devServer: {
      client: {
        overlay: false,
      },
      static: { 
        directory: path.resolve(__dirname, './static/UCCNC'), 
        publicPath: '/UCCNC'
      }
    }
  }

  let m = merge(baseConf(env), conf)
  console.log(JSON.stringify(m, null , '  '))
  return m;
};

const HtmlWebpackPlugin = require('html-webpack-plugin'); //installed via npm
const CopyWebpackPlugin = require('copy-webpack-plugin');

const baseConf = require('leet-mvc/webpack.base.config');
const {merge} = require('webpack-merge');
const webpack = require('webpack')

const path = require('path');


module.exports = (env) => {
  console.log(env)
  var production = env.production
  if (!env.env) env.env="development";
  var plugins = [];
 
  plugins.push(new HtmlWebpackPlugin({ template: './src/index.html' }));
  plugins.push(new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('development')
  }))
  plugins.push(
    new CopyWebpackPlugin({
      patterns:[
        { from: 'static/UCCNC', to: 'UCCNC' }
      ]
    })
  );

  const conf = {
    plugins,
    mode: production ? 'production' : 'development',
    output: {
      path: path.resolve(__dirname, 'www')
    },
    stats: {
      warnings: false
    },
    devServer: {
      port: env.env == 'test' ? 9999 : 9000,
      client: {
        overlay: false,
      },
      
      static: { 
        directory: path.resolve(__dirname, './static/UCCNC'), 
        publicPath: '/UCCNC'
      }
    },
    resolve: {
      extensions: ['.ts', '.js', '.json'],
      alias: {
        src: path.resolve(__dirname, 'src'),
        config: path.resolve(__dirname, `src/configs/config.${env.env}.js`),
      }
    },
  }

  let m = merge(baseConf(env), conf)
  //console.log(JSON.stringify(m, null , '  '))
  return m;
};

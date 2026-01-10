const path = require('path');

module.exports = {
  mode: 'development',
  entry: './webpack-src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        // use: {
        //   loader: 'babel-loader',
        //   options: {
        //     presets: [
        //       ['@babel/preset-env', {
        //         targets: {
        //           browsers: ['> 0.5%', 'last 2 versions', 'not dead']
        //         },
        //         modules: 'auto' // или false для сохранения ES модулей
        //       }]
        //     ],
        //   }
        // }
      }
    ]
  },
};
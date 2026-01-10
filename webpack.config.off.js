const path = require('path');

module.exports = {
  // Точка входа (начало построения графа зависимостей)
  entry: './webpack-src/index.js',

  // Настройки вывода
  output: {
    path: path.resolve(__dirname, 'dist'), // папка для выходного файла
    filename: 'bundle.js',               // имя бандла
    clean: true                           // очищать dist перед каждой сборкой
  },

  // Режим сборки
  mode: 'development', // или 'production' для минификации

  // Правила для обработки файлов
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader' // если нужен транспайлинг (например, для ES6+)
        }
      }
    ]
  },

  // Оптимизации (опционально)
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  }
};

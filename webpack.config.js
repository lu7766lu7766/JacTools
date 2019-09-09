const path = require('path')

module.exports = {
  entry: {
    index: './index.js'
  },
  output: {
    filename: 'index.js',
    path: path.resolve('./dist')
  },
  module: {
    rules: [
      {
        test: /.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  }
}
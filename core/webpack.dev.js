
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseWebpack = require('./webpack.base')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const {styleLoaders, htmlPage} = require('./tools')
module.exports = merge(baseWebpack, {
  watch: true,
  module: {
    rules: styleLoaders({ sourceMap: false })
  },
  mode: 'development',
  devtool: 'cheap-source-map',
  plugins: [
    htmlPage('Clove sign Plugin', 'popup'),
    htmlPage('background', 'background'),
    new FriendlyErrorsPlugin()
  ]
})

const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseWebpack = require('./webpack.base')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const {styleLoaders, htmlPage} = require('./tools')
module.exports = merge(baseWebpack, {
  module: {
    rules: styleLoaders({ extract: true, sourceMap: true })
  },
  mode: 'production',
  optimization: {
    splitChunks :{
      chunks: 'all',
      name: false,
    },
  },
  plugins: [
    htmlPage('Clove sign Plugin', 'popup'),
    htmlPage('background', 'background'),
    new CleanWebpackPlugin(['build/*.*']),
    new OptimizeCSSPlugin({
      cssProcessorOptions: {
        safe: true
      }
    }),
    new CssExtractPlugin({
      filename: 'css/[name].[contenthash].css'
    }),
    new webpack.HashedModuleIdsPlugin(),
  ]
})

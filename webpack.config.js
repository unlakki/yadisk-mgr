const path = require('path');
const webpack = require('webpack');
const webpackNodeExternals = require('webpack-node-externals');
const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  target: 'node',
  entry: './src/index.ts',
  mode: isProd ? 'production' : 'development',
  output: {
    libraryTarget: 'umd',
    path: path.resolve('lib'),
    filename: 'index.js',
  },
  module: {
    rules: [{
      test: /\.ts$/,
      use: {
        loader: 'ts-loader',
      },
    }, ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  externals: [
    webpackNodeExternals({
      whitelist: ['bluebird'],
    }),
  ],
  devtool: isProd ? false : 'source-map',
  plugins: [new CleanWebpackPlugin(), new webpack.optimize.ModuleConcatenationPlugin()],
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
};
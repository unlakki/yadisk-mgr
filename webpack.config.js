const path = require('path');
const webpackNodeExternals = require('webpack-node-externals');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  target: 'node',
  entry: './src/index.ts',
  mode: 'production',
  output: {
    libraryTarget: 'umd',
    path: path.resolve('./lib'),
    filename: 'index.js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  externals: [
    webpackNodeExternals({
      whitelist: [
        'bluebird',
        'request',
        'request-promise',
        'request-promise/errors',
      ],
    }),
  ],
  devtool: false,
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin(),
    ],
  },
};

/* eslint-disable */

const path = require('path');
const webpack = require('webpack');

module.exports = {
  target: 'node',
  entry: './src/index.ts',
  mode: 'production',
  output: {
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
  externals: [],
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
};

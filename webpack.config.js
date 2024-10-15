const path = require('path');
const defaultConfig = require('@wordpress/scripts/config/webpack.config');

module.exports = {
  ...defaultConfig,
  entry: {
    index: path.resolve(process.cwd(), 'src', 'index.js'),
  },
  output: {
    path: path.resolve(process.cwd(), 'build'),
    filename: '[name].js',
  },
  // watch: true,
};
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/sdk-loader.js',
  output: {
    path: path.resolve(__dirname, 'dist-webpack'),
    filename: 'sdk-bundle.js',
    clean: true,
  },
  resolve: {
    extensions: ['.js'],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'index.html', to: 'index.html' },
        { from: 'toss-integration.js', to: 'toss-integration.js' },
        { from: 'assets', to: 'assets' },
      ],
    }),
  ],
};

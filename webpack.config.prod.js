const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      inject: false,
    }),
    new CopyPlugin({
      patterns: [
        { from: 'img', to: 'img', globOptions: { ignore: ['**/.gitkeep'] } },
        { from: 'css', to: 'css' },
        ...['start-guide', 'information', 'transport', 'donate'].map((page) => ({
          from: `${page}/index.html`,
          to: `${page}/index.html`,
        })),
        { from: 'robots.txt', to: 'robots.txt' },
        { from: '404.html', to: '404.html' },
        { from: 'site.webmanifest', to: 'site.webmanifest' },
      ],
    }),
  ],
});

// webpack.config.js
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './index.js',
  target: 'node',
  mode: process.env.NODE_ENV || 'production',

  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'api.bundle.js',
    clean: true, // ✅ Automatically clean output folder
  },

  externals: [nodeExternals()], // ✅ Prevent bundling node_modules
  plugins: [
    new CopyPlugin({
      patterns: [{ from: 'public', to: 'public' }],
    }),
  ],
  resolve: {
    extensions: ['.js', '.json'], // ✅ Simplifies imports
    alias: {
      '@root': path.resolve(__dirname), // Optional shortcut alias
    },
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true, // ✅ Faster rebuilds
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: { node: '18' }, // ✅ Optimize for current Node version
                },
              ],
            ],
            plugins: [
              '@babel/plugin-transform-runtime', // ✅ Handles async/await helpers efficiently
              // process.env.NODE_ENV === 'production' && 'babel-plugin-transform-remove-console',
            ].filter(Boolean),
          },
        },
      },
    ],
  },

  node: {
    __dirname: false,
    __filename: false,
  },

  optimization: {
    minimize: true, // ✅ Explicit minification for smaller bundle
  },
};

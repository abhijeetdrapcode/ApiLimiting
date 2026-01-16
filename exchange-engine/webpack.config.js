const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './index.js',
  target: 'node24',
  mode: process.env.NODE_ENV || 'production',

  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'api.bundle.js',
    clean: true,
  },

  externals: [nodeExternals()],

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
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
    minimize: process.env.NODE_ENV === 'production',
    nodeEnv: process.env.NODE_ENV || 'production',
  },

  stats: {
    errorDetails: true,
  },
};

const path = require('path');

const slsw = require('serverless-webpack');
const TerserPlugin = require('terser-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const folderName = './.webpack/';

module.exports = {
  entry: slsw.lib.entries,
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  devtool: slsw.lib.webpack.isLocal ? 'eval-cheap-module-source-map' : 'source-map',
  resolve: {
    extensions: ['.js', '.json', '.ts', '.tsx'],
    plugins: [new TsconfigPathsPlugin()],
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, `${folderName}`),
    filename: '[name].js',
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_classnames: true,
          keep_fnames: true,
        },
        parallel: true,
      }),
    ],
  },
  externals: [
    {
      'aws-sdk': 'commonjs aws-sdk',
      argon2: 'argon2',
    },
  ],
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        include: path.resolve(__dirname, 'src'),
        use: [
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                module: 'es6',
                target: 'es2017',
              },
              transpileOnly: true,
            },
          },
        ],
      },
    ],
  },
};

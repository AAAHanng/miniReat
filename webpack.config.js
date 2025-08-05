const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development', // 强制开发模式，便于调试源码
  entry: './src/index.tsx',

  // output: {
  //   path: path.resolve(__dirname, 'dist'),
  //   filename: 'bundle.js',
  //   clean: true,
  // },

  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env'],
              ['@babel/preset-react', {
                pragma: 'createElement',
                runtime: 'classic'
              }]
            ]
          }
        }

      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      title: 'My React App'
    })
  ],

  devtool: 'source-map',

  devServer: {
    static: './dist',
    hot: true,
    port: 3000,
    open: true
  }
};

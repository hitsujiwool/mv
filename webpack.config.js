const path = require('path');
const { DefinePlugin } = require('webpack');

module.exports = {
  entry: './src/javascripts/app.js',
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'app.js'
  },
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    compress: true,
    port: 4567
  },
  plugins: [
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }  
};

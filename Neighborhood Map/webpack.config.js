const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';
const cssDev = [
	'style-loader',
	'css-loader',
	{
		loader: 'postcss-loader',
		options: {
			ident: 'postcss',
	    plugins: (loader) => [
	      require('autoprefixer')(),
	      require('css-mqpacker')()
	    ]
		}
	},
	'sass-loader'
];
const cssProd = ExtractTextPlugin.extract({
  fallback: 'style-loader',
  use: [
    {loader: 'css-loader'},
		{
			loader: 'postcss-loader',
			options: {
				ident: 'postcss',
		    plugins: (loader) => [
		      require('autoprefixer')(),
		      require('css-mqpacker')()
		    ]
			}
		},
    {loader: 'sass-loader'}
  ]
});
const cssConfig = isProd ? cssProd : cssDev;
const conf = require('./conf.json');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'scripts.bundle.js'
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    hot: true,
    port: 9000,
    stats: 'errors-only',
    open: true
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: cssConfig
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'assets/images/[hash:8].[ext]'
            }
          },
          {
            loader: 'image-webpack-loader'
          }
        ]
      },
      {
        test: /\.(woff|woff2|ttf|eot)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'assets/fonts/[hash:8].[ext]'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Neighborhood',
			APIKEY: conf['API_KEY'],
      hash: true,
      template: './src/index.html'
    }),
    new ExtractTextPlugin({
      filename: 'styles.bundle.css',
      disable: !isProd,
      allChunks: true
    }),
    new webpack.HotModuleReplacementPlugin()
  ]
};

var webpack = require('webpack');

var browsers = '{browsers:["last 2 version"]}';

module.exports = {
	entry: {
		index: './app/index'
	},
	resolve: {
		extensions: ['', '.js', '.vue'],
		modulesDirectories: ["node_modules"],
		alias: {
			vue: 'vue/dist/vue.js'
		}
	},
	output: {
		path: __dirname + '/dist',
    filename: '[name].js',
    library: '$PDTV',
    libraryTarget: 'umd',
    umdNamedDefine: true
	},
	module: {
		loaders: [{
			test: /\.js$/,
			loader: 'babel',
			exclude: /node_modules/
		}, {
			test: /\.html$/,
			loader: 'string',
			exclude: /node_modules/
		}, {
			test: /\.png$/,
			loader: 'url',
			exclude: /node_modules/
		}, {
			test: /\.less$/,
			loader: 'style!css?sourceMap!autoprefixer?' + browsers + '!less'
		}]
	},
	devServer: {
    contentBase: './app',
    host: '0.0.0.0',
    port: 8000
  }
}

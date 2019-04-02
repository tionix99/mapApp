const path= require('path');
const webpack= require('webpack');

const HtmlWebpackPlugin= require('html-webpack-plugin');
const MiniCssExtractPlugin= require('mini-css-extract-plugin');
/* const ExtractTextPlugin = require('extract-text-webpack-plugin'); // depricated wp v.4 for css */
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin"); // минификация css

module.exports= {
	
	mode: 'production',

	
	entry: {
		/* vendors: [
			"react", 
			"react-dom", 
			"react-redux",
			"jquery",
			"jquery-ui/ui/core", 
			"jquery-ui/ui/widgets/resizable",
			"redux", 
			"immutable"
		], */
		
		bundle: "./src/app.jsx"

	}, 
	
	output:{
		path: path.resolve(__dirname, './build/'),
		/* chunkFilename: 'assets/js/[name].js', */
		filename: "assets/js/[name].js"
	},

	
	optimization: {
		splitChunks: {
			chunks: 'all',
			minSize: 24576,
			maxSize: 245760,
		}
	},

	module:{
		rules: [   
			{ // загрузчик для jsx
				test: /\.jsx?$/, // определяем тип файлов
				exclude: /(node_modules)/,  // исключаем из обработки папку node_modules
				loader: "babel-loader",   // определяем загрузчик
				options:{
					// presets:["env", "react"]
					presets: ["es2015", "react"]    
					// presets: ["es2016", "react"]    
				}
			},
			{
				test: /\.css$/,
				use: [ 
					{
						loader: MiniCssExtractPlugin.loader,
					}, 
					{
						loader: 'css-loader',
						options: {
							modules: 'global',
						},
					},
				],
			},
		]
	},
	
	plugins: [

		new OptimizeCSSAssetsPlugin({}),
		
		new MiniCssExtractPlugin({
			// Options similar to the same options in webpackOptions.output
			// both options are optional
			filename: "assets/css/[name].css",
			// chunkFilename: "[id].css"
		}),
		
		new webpack.DefinePlugin({
			DEV_MOD:  false,
		}),
		/* 
		
		 */
		new HtmlWebpackPlugin({
			inject: true, // true || 'head' || 'body' || false - установка куда будет инжектирован путь к bundle.js 
			filename: 'index.html',
			minify: {// if mode is 'production', otherwise false 
				removeComments: true,
				// collapseWhitespace: true,
                // removeRedundantAttributes: true,
                // useShortDoctype: true,
                // removeEmptyAttributes: true,
                // removeStyleLinkTypeAttributes: true,
                // keepClosingSlash: true,
                // minifyJS: true,
                // minifyCSS: true,
                // minifyURLs: true,
            }, 
			
			template: 'public/index.html' // путь к шаблону в который будут инжектриваны пути к сборке bundle.js (если inject: true)
		})
  	],

}
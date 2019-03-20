var path= require('path');
var webpack= require('webpack');



module.exports= {
	entry: "./src/app.jsx", // входная точка - исходный файл
	mode: 'production',
	
	output:{
		path: path.resolve(__dirname, './public'),
		publicPath: '/public/',
		filename: "bundle.js" 
	},
	
	module:{
		rules: [   //загрузчик для jsx
			{
				test: /\.jsx?$/, // определяем тип файлов
				exclude: /(node_modules)/,  // исключаем из обработки папку node_modules
				loader: "babel-loader",   // определяем загрузчик
				options:{
					// presets:["env", "react"]
					presets: ["es2015", "react"]    
					// presets: ["es2016", "react"]    
				}
			}
		]
	},
	
	plugins: [
		new webpack.DefinePlugin({
			DEV_MOD:  false,
		}),
		
  	],

}
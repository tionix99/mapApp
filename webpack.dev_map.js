const path= require('path');
const webpack= require('webpack');


module.exports= {
	entry: "./src/app.jsx", // входная точка - исходный файл
	mode: 'development',
	
	output: {
		path: path.resolve(__dirname, './public'), 
		filename: "bundle_dev.js"
	},
	
	devtool: "source-map",
	devServer: {
		// inline: true,
		hot: true,
		open: true,
		contentBase: './public', // путь к index_dev.html
		/* publicPath: '/assets/js/', // путь к сборке относительно contentBase */
		openPage: 'index_dev.html' // указывает какой файл нужно открыть (по умолчанию index.html)
	},

	plugins: [
		new webpack.DefinePlugin({
			DEV_MOD:  true,
		}),
		
		/* new webpack.ProvidePlugin({
			ReactDOM:     'react-dom',
		}), */
		
		
	],
	  
	module: {
		rules: [   
			{ // загрузчик для jsx
				test: /\.jsx?$/, // определяем тип файлов
				exclude: /(node_modules)/,  // исключаем из обработки папку node_modules
				loader: "babel-loader",   
				options:{
					// presets:["env", "react"]    
					presets: ["es2015", "react"]   
				}
			},{ // загрузчик для css
				test: /\.css$/,
				use: [
					'style-loader',
					{
						loader: 'css-loader',
						options: {
							// true Enables local scoped CSS by default (use local mode by default)
							// false Disable the CSS Modules spec, all CSS Modules features (like @value , :local , :global and composes ) will not work
							// 'local' Enables local scoped CSS by default (same as true value)
							// 'global' Enables global scoped CSS by default
							modules: 'global',
						}
					},
				],
			},
		]
	}
}
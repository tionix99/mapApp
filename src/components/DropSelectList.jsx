if (DEV_MOD) {
	console.log("DropSelectList load", Date.now());
}

import React from "react";
// eslint-disable-next-line no-unused-vars
import ButtonControl from "./ButtonControl.jsx"; // селектор 

// eslint-disable-next-line no-unused-vars
class DropSelectList extends React.Component { // компонент выпадающего списка 
	constructor(props) {
		super(props);
		this.selectInfo= {
			el: React.createRef(), // ссылка на элемент отображающий выбранное в выпадающем списке значение
			defval: ""
		};
	}

	shouldComponentUpdate() { return false; } // это неизменяемый компонент - обновление ему не нужно

	componentDidMount() { // значение this.selectInfo.defval устанавливает при своей инициализации ButtonControl, ButtonControl также по клику меняет this.selectInfo.current.textContent
		this.selectInfo.el.current.textContent= this.selectInfo.defval;
	}

	render() {
		if (DEV_MOD) {
			console.log (
				"DropSelectList render", 
				this.props.label,
				Date.now()
			);
		}

		return <li
			className= "downdrop"
		>
			<label>
				&#9660;{this.props.label}:
			</label>
			<a 
				ref= {this.selectInfo.el} // отображает включенную в выпадающем списк кнопку
			>
				...
			</a>

			<ButtonControl 
				className= "submenu" // заданный в style.css класс выпадающего списка
				mode= "select" // при выборе одного значения выбор с других значений снимается 

				status= "set" // при инициализации компонента ButtonControl устанавливает выбранным значение указанное в setting
				setting= {this.props.setting}
				
				info= {this.selectInfo} // передача ссылки на элемент this.selectInfo в ButtonControl позволяет изменять элемент this.selectInfo без обновления компонентов ButtonControl и DropSelectList

				buttons= {this.props.buttons}
				extClick= {this.props.extClick} // функци дополнительных действий при выборе
			/> 	
		</li>;

	}
}


export default DropSelectList;
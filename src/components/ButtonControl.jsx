import React, { Component } from "react";

if (process.env.NODE_ENV=== "development") {
	console.log("ButtonControl load", Date.now());
}

let setClass= { // класс btn помогает определить что клик произошел именно по элементу управления
	set: function (btn) { // устанавливает включенной кнопку если ее btn.lbl совпадает с this.props.setting
		if (this.props.setting=== btn.lbl) { 
			if (this.props.info) { // this.props.info элемент - родительского компонента еще не отрисованный на момент инициализации ButtonControl
				/* console.log(this.props.info); */
				this.props.info.defval= btn.label;// если есть this.props.info устанавливает его defval которое будет установлено в textContent родительским компонентом при его отрисовке
			} // такая система позволяет не запусать рендер родительского компонента для установки значения this.props.info
			return "btn ON";
			
		} else {
			return "btn";
		}
	},
	
	on: function() { return "btn ON";},// устанавливает все кнопки включенными
	
	off: function() { return "btn";}, // устанавливает все кнопки выключенными
};




class ButtonControl extends Component {
	constructor(props) {
		super(props);
		
		this.btnClass= setClass[props.status];

		this.onClick= (e)=> { // базовое поведение ButtonControl при клике
			/* if (process.env.NODE_ENV=== "development") {
				console.log ("!!!-ButtonControl click", Date.now());
				
			} */
			
			if (e.target.classList.contains("btn")) {
				let trg= e.target;
				let btn= this.props.buttons[e.target.value];

				if (this.props.mode=== "select") { // если установлен mode "select" убирает класс со всех элементов списка, устанавливает класс на элемент сгенерировавший событие
					let htmlCollection= trg.parentElement.children;
						
					for (var i= 0; i< htmlCollection.length; i++) {
						htmlCollection[i].classList.remove("ON");
					} 
			
					trg.classList.add("ON");
			
				} else { // иначе включает/выключает класс на элементе
					trg.classList.toggle("ON");
					
				}

				if (this.props.info) { //если была передана ссыклка на элемент info из родительского компонента - устанавливает его значение
					this.props.info.el.current.textContent= btn.label;
				}

				if (this.props.extClick) { // если была передана фукция расширенного поведения - выполняем ее
					this.props.extClick(btn, e.target);
				}
			}
		};
	}

	shouldComponentUpdate() { return false; }// запрет перерисовки компонента - этот компонент не обновляется при обновлении родителя
		
	
	render() {
		if (process.env.NODE_ENV=== "development") {
			console.log ("ButtonControl_render", Date.now());

		}
	
		return <ul
			className= {this.props.className} 
			onClick= {this.onClick}
		>
			{this.props.buttons.map((btn, i)=> {

				return <li 
					key= {i} 
					value= {i} 
					className= {this.btnClass(btn)}
					title= {btn.title}

				>
					{btn.label}

					
				</li>;

			})}
		</ul>;
	}
}








export default ButtonControl;
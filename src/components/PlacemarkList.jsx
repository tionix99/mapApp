if (DEV_MOD) {
	console.log("PlacemarkList load", Date.now());
}

import React from "react";

import { connect } from "react-redux";
import actions from "../data/actions.js";

import {
	mapFitToViewport,// установка карты в размер контейнера
} from "../api/ymap.js";



const formatSet= {
	gr_dec: {
		units: [".", "°"], // отображаемые символы выбранных единиц измеренияя формата

		min2: 0, // минимальное и максимальное значение дляя второго окна ввода координат  при указанном формате
		max2: 99,
	},

	gr_min: {
		units: ["°", "'"],
		
		min2: 0,
		max2: 59,
	}
};


// eslint-disable-next-line no-unused-vars
class InputNumber extends React.Component { 
	constructor(props) {
		super(props);

		this.state= { // компоненты React типа input не обновляют value без изменения state или props
			val: 0,
		};

		this.onKeyDown= (e)=> { // запрет ввода с клавиатуры
			e.preventDefault();
		};

		this.onChange= (e)=> { // событие изменения значения
			this.setState({
				val: Number(e.target.value)
			});

		};

		this.onMouseUp= ()=> { // событие окончания изменения значения
			this.props.path[this.props.index]= this.state.val; // установка значения val в переданный объект/массив
			this.props.inputCoords();
		};

		this.state.val= this.props.path[this.props.index]; // установка первичных значений
		this.value= this.props.path[this.props.index]; 

	}

	shouldComponentUpdate(nextProps, nextState) { 
		// this.value - значение которое отображает input
		// значение this.value изменяют два события - измение соответсвующего значения в state или изменение соответсвующего значения в props
		// событие изменения state имеет приоритет выполнения
		if (this.state.val!== nextState.val) { // эта проверка должна быть первой и иметь свой return чтбы лишний раз не отрабатывалась вторая
			this.value= nextState.val;
			return true;
		}

		if (this.value!== nextProps.path[this.props.index]) {
			this.value= nextProps.path[this.props.index];
			/* return true; */
		}
		
		return true;
	}

	render() {
		/* if (DEV_MOD) {
			console.log (
				"InputNumber render", 
				this.props.path[this.props.index],
				this.props.index,
				Date.now()
			);
		} */
		
		return <input 
			type= "number"
			value= {this.value}
			
			min= {this.props.min}
			max= {this.props.max}

			step= {this.props.step}

			onChange= {this.onChange}
			onKeyDown= {this.onKeyDown}
			onMouseUp= {this.onMouseUp}

		/>;
	}
}



// eslint-disable-next-line no-unused-vars
class CoordPlacemark extends React.Component { // компонент панели ввода координат
	constructor(props) {
		super(props);
		
		this.inputCoords= this.props.inputCoords.bind(false, this.props.placemark); // привязываем к событию объект placemark
		
		this.centerPlacemark= this.props.centerPlacemark.bind(false, this.props.placemark);
		this.deletePlacemark= this.props.deletePlacemark.bind(false, this.props.placemark);

	}

	shouldComponentUpdate(nextProps) { 
		if (this.props.placemark!== nextProps.placemark) { // обновлется при изменении placemark
			return true;
		}

		/* if (this.props.formatSet!== nextProps.formatSet) { // при изменении формата всегда изменяется placemark => проверка избыточна
			return true;
		} */

		if (this.props.step!== nextProps.step) { // при изменении шага 
			return true;
		}

		return false;
	}

	render() {
		if (DEV_MOD) {
			console.log (
				"CoordPlacemark render", 
				this.props.placemark.name,
				Date.now()
			);
		}

		return <ul
			className= "str"
		>
			<li>
				<label>
					Координаты {this.props.placemark.name}:
				</label>
			</li>
			
			<li>
				<label>
					Широта:
				</label>

				<InputNumber 
					min= {-89}
					max= {89}
					step= {this.props.step}

					path= {this.props.placemark.latitude}
					index= {0}
					
					inputCoords= {this.inputCoords}
				/>

				{this.props.formatSet.units[0]}

				<InputNumber 
					min= {this.props.formatSet.min2}
					max= {this.props.formatSet.max2}

					step= {this.props.step}

					path= {this.props.placemark.latitude}
					index= {1}
					
					inputCoords= {this.inputCoords}
				/> 

				{this.props.formatSet.units[1]}
				

			</li>

			<li>
				<label>
					Долгота:
				</label>

				<InputNumber 
					min= {-179}
					max= {179}
					step= {this.props.step}
					
					path= {this.props.placemark.longitude}
					index= {0}

					inputCoords= {this.inputCoords}
				/> 

				{this.props.formatSet.units[0]}
				
				<InputNumber 
					min= {this.props.formatSet.min2}
					max= {this.props.formatSet.max2}
					step= {this.props.step}

					path= {this.props.placemark.longitude}
					index= {1}
					
					inputCoords= {this.inputCoords}
				/>

				{this.props.formatSet.units[1]}
				<button
					onClick= {this.centerPlacemark}
				>
					C
				</button>
				<button
					onClick= {this.deletePlacemark}
				>
					X
				</button>
			</li>
				
		</ul>;

	}

}



class PlacemarkList extends React.Component { // компонент генерации списка координат меток
	constructor(props) {
		super(props);
		this.strings= 0;

		this.renderFunc= (placemarkStore)=> {
			this.list= [];
			this.formatSet= formatSet[this.props.format];

			for (var key in placemarkStore) { // проходим по объекту placemarkStore генерируя компоненты CoordPlacemark по его свойствам
				this.list.push(
					
					<CoordPlacemark 
						key= {key}
						
						placemark= {placemarkStore[key]}
						
						formatSet= {this.formatSet}
						step= {this.props.step}

						centerPlacemark= {this.props.centerPlacemark}
						deletePlacemark= {this.props.deletePlacemark}
						
						inputCoords= {this.props.inputCoords}

						
					/>
				);
			}
			return this.list;
		};
	}

	componentDidUpdate() {
		// после перерисовки компонента если число отображаемых меток изменилось то обновляем размер карты чтобы она помещалась в окно приложения
		if (this.strings!== Object.keys(this.props.placemarkStore).length) { // если изменилось количество отображаемых строк - подгоняем карту
			// eslint-disable-next-line no-undef
			if (DEV_MOD) {
				console.log("PlacemarkList update", Date.now());
			}
			
			mapFitToViewport();
			this.strings= Object.keys(this.props.placemarkStore).length;
		}
		
		
	}

	render() {
		if (DEV_MOD) {
			console.log (
				"PlacemarkList render", 
				/* this.props, */
				Date.now()
			);
		}

		return <ul>
			{
				this.renderFunc(this.props.placemarkStore)
			}
			
		</ul>;
	}
}



const PlacemarkListActions= {
	inputCoords: actions.inputCoords,

	centerPlacemark: actions.centerPlacemark,
	deletePlacemark: actions.deletePlacemark
};


// eslint-disable-next-line no-unused-vars
export default connect(
	function(state) {
		return { // данном случае мы просто устанавливаем, что значение this.props.placemarkStore в компоненте MainPanel будет соответствовать placemarkStore из хранилища
			placemarkStore: state.get("placemarkStore"),
		};
	},
	PlacemarkListActions //  набор действий, которые вызываются в компоненте MainPanel или в его дочерних компонентах. И опять же эти действия после этого мы сможем получить в компоненте MainPanel через значения this.props
)(PlacemarkList);


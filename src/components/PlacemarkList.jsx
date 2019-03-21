if (DEV_MOD) {
	console.log("PlacemarkList load", Date.now());
}

import React from "react";

import {
	mapFitToViewport,// установка карты в размер контейнера
} from "../api/ymap.js";





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
			this.props.evInputCoords();
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
		
		this.evInputCoords= this.props.evInputCoords.bind(false, this.props.placemark); // привязываем к событию объект placemark
		this.evDeletePlacemark= this.props.evDeletePlacemark.bind(false, this.props.placemark);

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
					
					evInputCoords= {this.evInputCoords}
				/>

				{this.props.formatSet.units[0]}

				<InputNumber 
					min= {this.props.formatSet.min2}
					max= {this.props.formatSet.max2}

					step= {this.props.step}

					path= {this.props.placemark.latitude}
					index= {1}
					
					evInputCoords= {this.evInputCoords}
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

					evInputCoords= {this.evInputCoords}
				/> 

				{this.props.formatSet.units[0]}
				
				<InputNumber 
					min= {this.props.formatSet.min2}
					max= {this.props.formatSet.max2}
					step= {this.props.step}

					path= {this.props.placemark.longitude}
					index= {1}
					
					evInputCoords= {this.evInputCoords}
				/>

				{this.props.formatSet.units[1]}
				<button
					onClick= {this.evDeletePlacemark}
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
		this.inputs= 0;

		this.renderFunc= (placemarkStore)=> {
			let list= [];
			for (var key in placemarkStore) { // проходим по объекту placemarkStore генерируя компоненты CoordPlacemark по его свойствам
				list.push(
					<CoordPlacemark 
						key= {key}
						
						placemark= {placemarkStore[key]}
						formatSet= {this.props.formatSet}
						step= {this.props.step}

						evInputCoords= {this.props.evInputCoords}
						evDeletePlacemark= {this.props.evDeletePlacemark}
					/>
				);
			}
			return list;
		};
	}

	componentDidUpdate() {
		// после перерисовки компонента если число отображаемых меток изменилось то обновляем размер карты чтобы она помещалась в окно приложения
		if (this.inputs!== Object.keys(this.props.placemarkStore).length) { // если изменилось количество отображаемых строк - подгоняем карту
			// eslint-disable-next-line no-undef
			if (DEV_MOD) {
				console.log("PlacemarkList update", Date.now());
			}
			
			mapFitToViewport();
			this.inputs= Object.keys(this.props.placemarkStore).length;
		}
		
		
	}

	render() {
		if (DEV_MOD) {
			console.log (
				"PlacemarkList render", 
				/* this.props.placemark.label, */
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

	






export default PlacemarkList;
if (DEV_MOD) {
	console.log("CoordPanel load", Date.now());
}

import {
	thisMap, // объект карты созданный ymaps.Map
	mapSetCenterAndZoom, // центрирует и зуммирует карту исходяя из указанного массива координат

	addPlacemark, // добавление метки на карту
	movePlacemark, // перемещение метки по карте
	removeGeoObject, // удаелние метки а фактически любого указанного геообъекта

	addPolyline, // добавление полилинни по массиву координат
	addMultiRoute, // добавление маршрута по массиву координат
	
	getDistance, // расчет расстояния по геодезической линии между двумя координатами
	getMultiRouteDistance // расчет расстояяния по маршрутам
} from "../api/ymap.js";



// eslint-disable-next-line no-unused-vars
import ButtonControl from "./ButtonControl.jsx"; // селектор 

// eslint-disable-next-line no-unused-vars
import PlacemarkList from "./PlacemarkList.jsx"; // список указанных меток с окнами ввода координат

// eslint-disable-next-line no-unused-vars
import DistanceInfo from "./DistanceInfo.jsx"; // отображения рассчитанных расстояний




const formatButtons= [ // значения кнопок для выпадающего списка "формат"
	{lbl: "gr_dec", label: "dec 00.00°", title: "в градусах ° в виде десятичной дроби"},
	{lbl: "gr_min", label: "min 00°00'", title: "в градусах ° и  минутах '"},
];


const stepButtons= [ // значения кнопок для выпадающего списка "шаг"
	{lbl: 1, label: "x01"},
	{lbl: 5, label: "x05"},
	{lbl: 10, label: "x10"},
	{lbl: 15, label: "x15"},
	{lbl: 20, label: "x20"},
	
];


// eslint-disable-next-line no-unused-vars
class DropSelectList extends React.Component { // компонент выпадающего списка 
	constructor(props) {
		super(props);
		this.selectInfo= React.createRef(); // ссылка на элемент отображающий выбранное в выпадающем списке значение
	}

	shouldComponentUpdate() { } // это не изменяемый компонент - обновление ему не нужно

	componentDidMount() { // значение this.selectInfo.defval устанавливает при своей инициализации ButtonControl, ButtonControl также по клику меняет this.selectInfo.current.textContent
		this.selectInfo.current.textContent= this.selectInfo.defval;
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
			class= "downdrop"
		>
			<label>
				&#9660;{this.props.label}:
			</label>
			<a 
				ref= {this.selectInfo} // отображает включенную в выпадающем списк кнопку
			>
				...
			</a>

			<ButtonControl 
				class= "submenu" // заданный в style.css класс выпадающего списка
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



const formatSet= {
	gr_dec: {
		units: [".", "°"], // отображаемые символы выбранных единиц измеренияя формата

		min2: 0, // минимальное и максимальное значение дляя второго окна ввода координат  при указанном формате
		max2: 99,
		// так как формат уже dec то преобразование не требуется
		// однозначный ответ на вопрос что лучше - писать условие на существование функции или просто вызвать пустую мне неизвестен
		convertToDEC: function(coordinate) { 
			return coordinate;
		},

		convertVal: function(coordinate) { // преобразование из min в dec используется при смене формата
			coordinate[1]= Math.round(coordinate[1]/0.6);
		}
	},

	gr_min: {
		units: ["°", "'"],
		
		min2: 0,
		max2: 59,

		convertToDEC: function(coordinate) { // преобразование из min в dec
			return [
				coordinate[0],
				Math.round(coordinate[1]/0.6)
			];
	
		},

		convertVal: function(coordinate) { // преобразование из dec в min
			coordinate[1]= Math.round(coordinate[1]*0.6);
		}
	}
};

function roundTo00(num) { // преобразование 0.000000000 в 0.00
	return Math.round(num* 100)/100;
}

function arrToNum(arr) { // преобразование [0,0] в 00.00
	return arr[0]< 0 ? 
		roundTo00(arr[0] - arr[1]/100) :
		roundTo00(arr[0] + arr[1]/100);
}

function numToArr(num) { // преобразование  00.00 в [0,0]
	let inp2= Math.abs(Math.round((num%1)*100)); // дробная часть num приведенная к целому и взятая по модулю (тк дробная часть координаты положительна)
	return [
		Math.trunc(num), // целая часть num, trunc адекватно возвращает целую часть отрицательных чисел
		inp2> 99? 99: inp2 // иногда округленное значение может оказаться больше максимально возможного
	];
}


function allPlacemarkCoords() { // возвращает массив координат из placemarkStore
	let points= [];
	for (var key in placemarkStore) {
		points.push(placemarkStore[key].coords);
	}

	return points;
}

function calcDistance(points) { // расчет минимального расстояни
	if (points.length <2) {
		return 0;
	} else {
		let distance= 0;

		for (var i= 0, j= 1; j< points.length;) {
			distance= distance + getDistance(points[i], points[j]);
			
			i++;
			j++;
		}

		distance= roundTo00(distance/1000); // getDistance возвращает расстояние в метрах - переводим в километры и округляем до разумной точности

		return distance;
	}
}



const placemarkNames= "ABCDE"; // "массив" допустимых имен меток
const placemarkStore= { // хранилище меток
/* 	A: {
		name: "A",
		latitude: [55, 71], 
		longitude: [37, 57],
		coords: [0, 0],
		geoObj: geoObj // ссылка на объект метки указанны на карте созданный ymaps.Placemark
	},

*/
};





// eslint-disable-next-line no-unused-vars
class CoordPanel extends React.Component {
	constructor(props) {
		super(props);

		this.state= {
			format: formatButtons[0].lbl, 
			step: 1,
			update: Date.now() // простой способ обновить компонент когда параметры события нас не волнуют
		};

		this.formatSet= formatSet[this.state.format]; // this.formatSet= выбранные в банный момент настроййки формата
		
		this.shortDistance= 0; // рассчитываемая минимальная дистанция между точками
		this.multiDistance= []; // дистанция по маршрутам 

		this.autozoomON= "ON"; // значение кнопки "автозум"
		this.routeON= ""; // значение кнопки "маршрут"

		this.changeFormat= (format, placemark)=> { // изменяет latitude/longitude на значения указанного формата
			formatSet[format].convertVal(placemark.latitude);
			formatSet[format].convertVal(placemark.longitude);
		};

		this.coordsToArr= (placemark)=> { // заполнение полей latitude[]/longitude [] в placemark
			placemark.latitude= numToArr(placemark.coords[0]); // пробразование в фотмат latitude[]/longitude []
			placemark.longitude= numToArr(placemark.coords[1]);

			if (this.state.format=== "gr_min") { // ymaps использует формат в десятках и если текущий формат в минутах то преобразовываем
				this.changeFormat("gr_min", placemark);
			}

		};

		this.changePolyline= ()=> { // изменяет положение полилинии на карте и пересчитывает минимальную дистанцию
			let allCoords= allPlacemarkCoords();
			this.polyline.geometry.setCoordinates(allCoords);
			this.shortDistance= calcDistance(allCoords);
			return allCoords;
		};


		this.evAutozoomClick= (e)=> { // для разнообразия и для того чтобы не дергать компонент на обновление оформим переключатель autozoomON так
			if (e.target.classList.contains("ON")) {
				this.autozoomON= "";
				e.target.classList.remove("ON");
			} else {
				this.autozoomON= "ON";
				e.target.classList.add("ON");
			}
		};

		this.evRouteClick= (e)=> {
			if (e.target.classList.contains("ON")) { // если маршрут выключен - сбрасываем координаты this.multiRoute
				this.routeON= "";
				e.target.classList.remove("ON");
				
				this.multiRoute.model.setReferencePoints([]);

			} else { // иначе - устанавливаем координаты this.multiRoute
				this.routeON= "ON";
				e.target.classList.add("ON");
				
				this.multiRoute.model.setReferencePoints(allPlacemarkCoords());

			}
		};

		this.evClickFormat= (btn)=> { // клик по выпадающему списку "формат"
			if (DEV_MOD) {
				console.log (
					"!!! evClickFormat", 
					Date.now()
				);
			}
			
			if (this.state.format!== btn.lbl) { // проверка что клик произошел по другой кнопке а не по той же самой
				this.formatSet= formatSet[btn.lbl];
				
				for (var key in placemarkStore) { // меняем формат для всех меток в placemarkStore
					this.changeFormat(btn.lbl, placemarkStore[key]);

				}
				this.setState({format: btn.lbl});
			}
		};

		this.evClickStep= (btn)=> { // клик по выпадающему списку "шаг"
			if (DEV_MOD) {
				console.log (
					"!!! evClickStep", 
					Date.now()
				);
			}
			if (this.state.step!== btn.lbl) {
				this.setState({step: btn.lbl});
			}
		};

		this.evCreatePlacemark= (e)=> { // событие создания метки на карте

			if (DEV_MOD) {
				console.log (
					"!!! evCreatePlacemark", 
					Date.now()
				);
			}

			if (Object.keys(placemarkStore).length>= placemarkNames.length) { // если меток больше указанного количества
				alert("Максимальное количество точек: " +placemarkNames.length);

			} else { // иначе создаем placemark и помещаем в placemarkStore
				let placemark= {};
				
				for (var i= 0; i< placemarkNames.length; i++) { // поиск первого незанятого имени 
					if (!placemarkStore[placemarkNames[i]]) {
						placemark.name= placemarkNames[i];
						break;
					}
				}

				placemarkStore[placemark.name]= placemark;
				placemark.coords= e.get("coords"); // получения координат клика на карте
				placemark.geoObj= addPlacemark(placemark.name, placemark.coords); // создаем геообъект метки
				placemark.geoObj.properties.set({hintContent: "Координаты: " +placemark.coords});
				

				this.coordsToArr(placemark); //  заполнение полей latitude[]/longitude
				this.changePolyline(); // обновление положения полилинии и расстояния

				placemark.geoObj.events.add("contextmenu", // событие на правый клик (удаление метки)
					this.evDeletePlacemark.bind(false, placemark)
				);
				
	
				placemark.geoObj.events.add("dragend", ()=> {// событие окончание переноса метки (пересчет координат)
					if (DEV_MOD) {
						console.log (
							"!!! evDragEndPlacemark", 
							Date.now()
						);
					}
						
					placemark.coords= placemark.geoObj.geometry.getCoordinates(); // получение новых координат из геообъекта метки
					
					this.coordsToArr(placemark); //  заполнение полей latitude[]/longitude
					let allCoords= this.changePolyline();
					
					if (allCoords.length> 1) { // если точка только одна то нет смысла дергать карту
						mapSetCenterAndZoom( //зуммирование и центрирования карты по новым координатам 
							allCoords, 
							this.autozoomON=== "ON"
						); 

					}
					
					this.setState({update: Date.now()}); //обновление компонента
				});

				this.setState({update: Date.now()}); 
			}
		};

		this.evDeletePlacemark= (placemark)=> { // событие удаления метки с карты
			if (DEV_MOD) {
				console.log (
					"!!! evDeletePlacemark", 
					Date.now()
				);
			}
	
			removeGeoObject(placemark.geoObj); // удаление объекта метки с карты
			delete placemarkStore[placemark.name]; // удаление placemark из placemarkStore
			
			this.changePolyline();
			this.setState({update: Date.now()});
		};

		this.evInputCoords= (placemark)=> { // событие ввода координат в окне метки PlacemarkList
			if (DEV_MOD) {
				console.log (
					"!!! evInputCoords", 
					Date.now()
				);
			}
			
			placemark.coords[0]= arrToNum( // преобразуем latitude из [0,0] в 0.0
				this.formatSet.convertToDEC(placemark.latitude) // переводим latitude в десятичную форму если исходный формат того требует
			);
			placemark.coords[1]= arrToNum(this.formatSet.convertToDEC(placemark.longitude));
			
			movePlacemark(placemark.geoObj, placemark.coords); // перемещаем объект геометки на карте
			placemark.geoObj.properties.set({hintContent: "Координаты: " +placemark.coords});
			

			mapSetCenterAndZoom(
				this.changePolyline(), 
				this.autozoomON=== "ON"
			);

			this.setState({update: Date.now()});
		};

		
		

		thisMap.events.add("click", this.evCreatePlacemark); // событие клика по карте генерирующее событие создания метки

		this.polyline= addPolyline([]); // инициализация polyline
		this.multiRoute= addMultiRoute([]); // инициализация multiRoute
		
		this.multiRoute.model.events // multiRoute обновляется ассинхронно и медленно вещаем события на его обновление
			.add("requestsuccess", ()=> {
				this.multiDistance= getMultiRouteDistance(this.multiRoute); // обновление данных расстояния по маршруту
				this.setState({update: Date.now()});
			})

			.add("requestfail", function (event) {
				this.multiDistance= [];
				this.setState({update: Date.now()});
				console.log("Ошибка: " + event.get("error").message);
			});
	}

	render() {
		if (DEV_MOD) {
			console.log (
				"CoordPanel render", 

				Date.now()
			);
		}

		return <div>
			<ul
				class= "str"
			>	
				<li>
					<button
						class= {this.autozoomON}
						onClick= {this.evAutozoomClick}
					>
						автозум
					</button>
					<button
						class= {this.routeON}
						onClick= {this.evRouteClick}
					>
						маршрут
					</button>
				</li>

				<DropSelectList 
					label= "формат"
					buttons= {formatButtons} //если определять массивы функции и объекты внутри компонента то они будут пересоздаваться при каждом обновлении, следует избегать этого

					setting= {this.state.format} 
					extClick= {this.evClickFormat}
				/>
			
				<DropSelectList 
					label= "шаг"
					buttons= {stepButtons}
				
					setting= {this.state.step}
					extClick= {this.evClickStep}
				/>
				
			</ul>
			
			<PlacemarkList // компонент отображающий координаты установленных меток
				placemarkStore= {placemarkStore}

				formatSet= {this.formatSet}
				step= {this.state.step}

				/* distance= {this.shortDistance} */
				evInputCoords= {this.evInputCoords}
				evDeletePlacemark= {this.evDeletePlacemark}
			/>

			<DistanceInfo // компонент отображающий информацию о дистанциях
				shortDistance= {this.shortDistance}
				multiDistance= {this.multiDistance}
			/>
			

		</div>;




		



	}

}

export default CoordPanel;

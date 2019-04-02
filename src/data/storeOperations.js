const redux= require("redux");
import reducer from "./reducer.js";

var store;

import { Map } from "immutable";

import {
	thisMap, // объект карты созданный ymaps.Map
	mapSetCenter,
	mapSetCenterAndZoom, // центрирует и зуммирует карту исходяя из указанного массива координат

	addPlacemark, // добавление метки на карту
	movePlacemark, // перемещение метки по карте
	removeGeoObject, // удаелние метки а фактически любого указанного геообъекта

	addPolyline, // добавление полилинии по массиву координат
	addMultiRoute, // добавление маршрута по массиву координат
	
	getPointsDistance, // расчет расстояния по геодезической линии между двумя координатами
	getMultiRouteDistance // расчет расстояния по маршрутам
} from "../api/ymap.js";


const convertCoordinate= {
	gr_dec: {
		forCoords: function(coordinate) { 
			return coordinate;
		},

		forLatLng: function(coordinate) { // преобразование из min в dec используется при смене формата
			coordinate[1]= Math.round(coordinate[1]/0.6);
		}
	},

	gr_min: {
		forCoords: function(coordinate) { // преобразование из min в dec
			return [
				coordinate[0],
				Math.round(coordinate[1]/0.6)
			];
	
		},

		forLatLng: function(coordinate) { // преобразование из dec в min
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


function changeFormat(format, placemark) { // изменяет latitude/longitude на значения указанного формата
	convertCoordinate[format].forLatLng(placemark.latitude);
	convertCoordinate[format].forLatLng(placemark.longitude);
}


function coordsToLatLng(placemark, format) { // заполнение полей latitude[]/longitude[] в placemark по значению coords
	placemark.latitude= numToArr(placemark.coords[0]); // пробразование в фотмат latitude[]/longitude[]
	placemark.longitude= numToArr(placemark.coords[1]);

	if (format=== "gr_min") { // ymaps использует формат в десятках и если текущий формат в минутах то преобразовываем в минуты
		changeFormat(format, placemark);
	}

}

function latLngToCoords(placemark, format) { // заполнение coords в placemark по значению latitude[]/longitude[]
	placemark.coords[0]= arrToNum(convertCoordinate[format].forCoords(placemark.latitude));// преобразуем latitude из [0,0] в 0.0
	placemark.coords[1]= arrToNum(convertCoordinate[format].forCoords(placemark.longitude));
}



function allPlacemarkCoords(placemarkStore) { // возвращает массив координат из placemarkStore
	let points= [];
	for (var key in placemarkStore) {
		points.push(placemarkStore[key].coords);
	}

	return points;
}


function changePlacemarks(state, placemarkStore, centerAndZoom) {
	
	let points= allPlacemarkCoords(placemarkStore);
	thisPolyline.geometry.setCoordinates(points);

	if (
		centerAndZoom
		&& state.get("formSet").autozoom=== "ON"
	) {
		mapSetCenterAndZoom(points); //зуммирование и центрирования карты по новым координатам 
	}
	
	let distanceInfo= state.get("distanceInfo");
	distanceInfo.polylineRoute= getPointsDistance(points);

	state.set("distanceInfo", Object.assign({}, distanceInfo));

	return state.set("placemarkStore", Object.assign({}, placemarkStore));

}



const placemarkNames= "ABCDE"; // "массив" допустимых имен меток

var thisPolyline;
var thisMultiRoute;


function CREATE_STORE() {
	if (DEV_MOD) {
		console.log (
			"*** CREATE_STORE", 
			Date.now()
		);
	}

	store= redux.createStore(reducer); //В метод redux.createStore() следует передать функцию reducer, которая используется для обновления хранилища.
	return store;
}


function INITIAL_STATE() { 
	if (DEV_MOD) {
		console.log (
			"*** INITIAL_STATE", 
			Date.now()
		);
	}
	
	thisMap.events.add("click", (e)=> { // событие на левый клик (создание метки)
		store.dispatch({ // событие клика по карте генерирующее событие создания метки
			type: "CREATE_PLACEMARK", 
			e
		});
	});


	thisPolyline= addPolyline([]); // инициализация polyline
	thisMultiRoute= addMultiRoute([]); // инициализация multiRoute

	thisMultiRoute.model.events // multiRoute обновляется ассинхронно и медленно вещаем события на его обновление
		.add("requestsuccess", ()=> {
			
			store.dispatch({   // обновление данных расстояния по маршруту
				type: "CHANGE_MULTIROUTE", 
				distance: getMultiRouteDistance(thisMultiRoute)
			});

		})

		.add("requestfail", (e)=> {
			store.dispatch({   // обновление данных расстояния по маршруту
				type: "CHANGE_MULTIROUTE", 
				distance: []
			});

			console.log("Ошибка: " + e.get("error").message);
		});

	return Map({
		formSet: {
			autozoom: "ON",
			multiroute: "",
			format: "gr_dec",
			step: 1
		},
		
		placemarkStore: {
		/* 	A: {
			name: "A",
			latitude: [55, 71], 
			longitude: [37, 57],
			coords: [0, 0],
			geoObj: geoObj // ссылка на объект метки указанны на карте созданный ymaps.Placemark
		}, */
		},

		distanceInfo: {
			polylineRoute: 0,
			multiRoute: []
		}
	});
}

/* 
function SET_STATE(state, action) {
	return state.merge(action.state); // merge добавляет несуществующие и изменяет существующие свойства объекта
}
*/


function CLICK_AUTOZOOM(state, e) {
	if (DEV_MOD) {
		console.log (
			"*** CLICK_AUTOZOOM", 
			Date.now()
		);
	}

	let formSet= state.get("formSet");

	if (e.target.classList.contains("ON")) {
		formSet.autozoom= "";

	} else {
		formSet.autozoom= "ON";
		mapSetCenterAndZoom(
			allPlacemarkCoords(state.get("placemarkStore"))
		);
	}

	return state.set("formSet", Object.assign({}, formSet));

}


function CLICK_MULTIROUTE(state, e) {
	if (DEV_MOD) {
		console.log (
			"*** CLICK_MULTIROUTE", 
			Date.now()
		);
	}

	let formSet= state.get("formSet");

	if (e.target.classList.contains("ON")) {
		formSet.multiroute= "";
		thisMultiRoute.model.setReferencePoints([]);

	} else {
		formSet.multiroute= "ON";
		thisMultiRoute.model.setReferencePoints(
			allPlacemarkCoords(state.get("placemarkStore"))
		);
	}

	return state.set("formSet", Object.assign({}, formSet));

}


function CHANGE_FORMAT(state, format) {
	if (DEV_MOD) {
		console.log (
			"*** CHANGE_FORMAT", 
			format,
			Date.now()
		);
	}
	
	let formSet= state.get("formSet");
	
	if (formSet.format!== format) { // проверка что клик произошел по другой кнопке а не по той же самой
		let placemarkStore= state.get("placemarkStore");
		
		formSet.format= format;
		
		for (var key in placemarkStore) { // меняем формат для всех меток в placemarkStore
			changeFormat(format, placemarkStore[key]);
			placemarkStore[key]= Object.assign({}, placemarkStore[key]);
		}
		
		state.set("placemarkStore", placemarkStore); // тут нет необходимости использовать Object.assign тк компонент PlaacemarkList и так будет обновлться по изменению format
	}

	return state.set("formSet", Object.assign({}, formSet));
}


function CHANGE_STEP(state, step) {
	if (DEV_MOD) {
		console.log (
			"*** CHANGE_STEP", 
			step,
			Date.now()
		);
	}

	let formSet= state.get("formSet");
	formSet.step= step;

	return state.set("formSet", Object.assign({}, formSet));

}


function CREATE_PLACEMARK(state, e) {
	if (DEV_MOD) {
		console.log (
			"*** CREATE_PLACEMARK", 
			Date.now()
		);
	}
	
	let placemarkStore= state.get("placemarkStore");
	
	if (Object.keys(placemarkStore).length>= placemarkNames.length) { // если меток больше указанного количества
		alert("Максимальное количество точек: " +placemarkNames.length);
		return state;

	} else {
		let placemark= {};

		for (var i= 0; i< placemarkNames.length; i++) { // поиск первого незанятого имени 
			if (!placemarkStore[placemarkNames[i]]) {
				placemark.name= placemarkNames[i];
				break;
			}
		}

		placemark.coords= e.get("coords"); // получения координат клика на карте
		
		coordsToLatLng(//  заполнение полей latitude[]/longitude
			placemark, 
			state.get("formSet").format
		); 

		placemark.geoObj= addPlacemark(placemark.name, placemark.coords); // создаем геообъект метки
		placemark.geoObj.properties.set({hintContent: "Координаты: " +placemark.coords[0]+ "° " +placemark.coords[1]+ "°"});
		
		placemark.geoObj.events.add("contextmenu", ()=> { // событие на правый клик (удаление метки)
			if (DEV_MOD) {
				console.log (
					"!!! DELETE_PLACEMARK", 
					Date.now()
				);
			}
			
			store.dispatch({  
				type: "DELETE_PLACEMARK", 
				placemark
			});

		});
				
		placemark.geoObj.events.add("dragend", ()=> {// событие окончание переноса метки (пересчет координат)		
			if (DEV_MOD) {
				console.log (
					"!!! MOVE_PLACEMARK", 
					Date.now()
				);
			}

			placemark.coords= placemark.geoObj.geometry.getCoordinates(); // получение новых координат из геообъекта метки		
			placemark.geoObj.properties.set({hintContent: "Координаты: " +placemark.coords[0]+ "° " +placemark.coords[1]+ "°"});

			coordsToLatLng(// обновление полей latitude[]/longitude
				placemark, 
				store.getState().get("formSet").format
			); 

			store.dispatch({
				type: "MOVE_PLACEMARK", 
				placemark
			});

		});

		
		placemarkStore[placemark.name]= placemark;
		return changePlacemarks(state, placemarkStore, false);
	}
	
}



function CENTER_PLACEMARK(state, placemark) {
	if (DEV_MOD) {
		console.log (
			"*** CENTER_PLACEMARK", 
			Date.now()
		);
	}

	let formSet= state.get("formSet");
	formSet.autozoom= "";

	mapSetCenter(placemark.coords);
	
	return state.set(Object.assign({}, formSet));
}


function MOVE_PLACEMARK(state, placemark) {
	if (DEV_MOD) {
		console.log (
			"*** MOVE_PLACEMARK", 
			Date.now()
		);
	}
	
	let placemarkStore= state.get("placemarkStore");
	placemarkStore[placemark.name]= Object.assign({}, placemark);
	
	return changePlacemarks(state, placemarkStore, Object.keys(placemarkStore).length> 1);

}


function DELETE_PLACEMARK(state, placemark) { // удаление метки с карты
	if (DEV_MOD) {
		console.log (
			"*** DELETE_PLACEMARK", 
			Date.now()
		);
	}
	let placemarkStore= state.get("placemarkStore");

	removeGeoObject(placemark.geoObj); // удаление объекта метки с карты
	delete placemarkStore[placemark.name]; // удаление placemark из placemarkStore

	return changePlacemarks(state, placemarkStore, false);
}

function INPUT_COORDS(state, placemark) {
	if (DEV_MOD) {
		console.log (
			"*** INPUT_COORDS", 
			/* state, placemark, */
			Date.now()
		);
	}

	let placemarkStore= state.get("placemarkStore");

	latLngToCoords(
		placemark,
		state.get("formSet").format
	); // обновляем placemark.coords по значениям placemark.latitude/placemark.longitude
	
	movePlacemark(placemark.geoObj, placemark.coords); // перемещаем объект геометки на карте

	placemarkStore[placemark.name]= Object.assign({}, placemark);
	
	return changePlacemarks(state, placemarkStore, true);
}




function CHANGE_MULTIROUTE(state, distance) {
	if (DEV_MOD) {
		console.log (
			"*** CHANGE_MULTIROUTE", 
			distance,
			Date.now()
		);
	}

	let distanceInfo= state.get("distanceInfo");

	distanceInfo.multiRoute= distance;
	
	return state.set("distanceInfo", Object.assign({}, distanceInfo));

}






export {
	CREATE_STORE,
	
	INITIAL_STATE,

	CLICK_AUTOZOOM,
	CLICK_MULTIROUTE,

	CHANGE_STEP,
	CHANGE_FORMAT,

	CREATE_PLACEMARK,
	MOVE_PLACEMARK,
	DELETE_PLACEMARK,
	CENTER_PLACEMARK,

	INPUT_COORDS,
	
	CHANGE_MULTIROUTE,

};
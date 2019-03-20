var thisMap;
var mapContainer;
var appContainer;


/* 
Координаты (широта от −90° до +90°, долгота от −180° до +180°) могут записываться:
    в ° градусах в виде десятичной дроби (современный вариант)
    в ° градусах и ′ минутах с десятичной дробью
*/

function initMap(mapEl, appEl) {
	if (DEV_MOD) {
		console.log ("*** initMap", Date.now());
	}

	appContainer= appEl;
	mapContainer= mapEl;
	// Создание карты.
	// https://tech.yandex.ru/maps/doc/jsapi/2.1/dg/concepts/map-docpage/
	
	
	thisMap= new ymaps.Map(mapContainer, {
		// Координаты центра карты.
		// Порядок по умолчнию: «широта, долгота».
		center: [57.00, 33.00],
		// Уровень масштабирования. Допустимые значения:
		// от 0 (весь мир) до 19.
		zoom: 5,
		
		// Элементы управления
		// https://tech.yandex.ru/maps/doc/jsapi/2.1/dg/concepts/controls/standard-docpage/
		controls: [

			/* "zoomControl", // Ползунок масштаба */
			/* 	"rulerControl", // Линейка */
			/* "routeButtonControl", // Панель маршрутизации */
			/* "trafficControl", // Пробки */
			"typeSelector", // Переключатель слоев карты
			/* "fullscreenControl", // Переключатель полноэкранного режима */

			// Поисковая строка
			/* new ymaps.control.SearchControl({
				options: {
					// вид - поисковая строка
					size: "large",
					// Включим возможность искать не только топонимы, но и организации.
					provider: "yandex#search"
				}
			}) */

		]
	});

	thisMap.controls.add("zoomControl", {
		size: "large", 
		position: {right: "5px", top: "44px"},
		zoomStep: 1
	}); 
	
}

function mapSetCenter(coords, zoom) { // центрирует карту 
	thisMap.setCenter(coords, zoom);
}

/* function mapSetZoom(zoom) { // зуммирует карту 
	thisMap.setZoom(zoom);
} */

function mapFitToViewport() { // изменяет размер контейнера карты и саму карту в соответсвии с рамерами других элементов
	if (DEV_MOD) {
		console.log ("*** mapFitToViewport", Date.now());
	}
	mapContainer.style.height= (appContainer.clientHeight- mapContainer.offsetTop) + "px";
	thisMap.container.fitToViewport();
}


function mapSetCenterAndZoom(points, condition) { // центрирует и зуммирует карту по нескольким точкам
	
	if (condition) {
		if (DEV_MOD) {
			console.log ("*** mapSetCenterAndZoom", Date.now());
		}
		
		if (points.length=== 1) { // если точка всего одна центрируем карту по ней
			mapSetCenter(points[0]);
			return;
		}
		/* if (a меньше b по некоторому критерию сортировки) {
				return -1;
			} 
		*/
		points.sort(function(a, b) { // для адекватной установки center требуется чтобы первым значением была координата с минимальной долготой
			return a[1] - b[1];
		});

		// масштаб и центрование рассчитывается по двум точкам с минимальными и максимальными координатами 
		// минимальное и максимальное значение долготы уже определены сортировкой - это первый и последний элементы points
		// если точек больше двух определим минимальную и максимальную широту самостоятельно
		
		if (points.length> 2) { 
			let min0= points[0][0];
			let max0= points[0][0];

			for (var i= 0; i < points.length; i++) { 
				if (min0 > points[i][0]) {
					min0= points[i][0];
			
				} else if (max0 < points[i][0]) {
					max0= points[i][0];
		
				}
			}

			points= [
				[min0, points[0][1]],
				[max0, points[points.length- 1][1]]
			];

		}
		
		let result= ymaps.util.bounds.getCenterAndZoom(points, thisMap.container.getSize());
		
		/* mapSetZoom(result.zoom); */
		mapSetCenter(result.center, result.zoom);
	}
	
	
	
}


function addPlacemark(name, coords) { // добавление метки на карту
	if (DEV_MOD) {
		console.log ("*** addPlacemark", Date.now());
	}

	let placemark= new ymaps.Placemark(coords, {
		// Хинт показывается при наведении мышкой на иконку метки.
		iconContent: name,
		hintContent: "Координаты: " +coords,
		/* balloonContent: "метка: " +name, */
	}, {
		draggable: true // разрешение перетаскивания метки
	});

	// После того как метка была создана, добавляем её на карту.
	thisMap.geoObjects.add(placemark);
	return placemark;
}

function addPolyline(points) {
	let polyline= new ymaps.Polyline(points, {}, {});
	thisMap.geoObjects.add(polyline);
	/* polyline.editor.startEditing(); // возможность добавления точек*/
	return polyline;
}



function movePlacemark(geoObj, coords) { // преремещение геообъекта на указанные координаты
	/* if (DEV_MOD) {
		console.log ("*** movePlacemark", Date.now());
	} */

	geoObj.geometry.setCoordinates(coords);
	geoObj.properties.set({hintContent: "Координаты: " +coords});
}

function getDistance(coords1, coords2) { // получение минимальной дистанции между двумя точками
	return ymaps.coordSystem.geo.getDistance(coords1, coords2);
}

function getMultiRouteDistance(multiRoute) { // получения дистанции по маршруту
	let routes= multiRoute.model.getRoutes();
	let distanceRoutes= [];

	for (var i= 0; i < routes.length; i++) {
		distanceRoutes.push(
			/* Math.round(((routes[i].properties.get("distance").value)/1000)* 100)/100 */
			routes[i].properties.get("distance").text
		);
		
	}
	return distanceRoutes;

}

function addMultiRoute(points) { // добавление маршрута

	if (DEV_MOD) {
		console.log ("*** addMultiRoute", Date.now());
	}
		

	let multiRoute= new ymaps.multiRouter.MultiRoute({
		/* referencePoints: ["Москва", "Тверь"] */
		/* referencePoints: [[55,65, 37,55], [56.90, 35,68]] */
		referencePoints: points
	}, {
		// Тип промежуточных точек, которые могут быть добавлены при редактировании.
		editorMidPointsType: "via",
		// В режиме добавления новых путевых точек запрещаем ставить точки поверх объектов карты.
		editorDrawOver: false
	});
	
	thisMap.geoObjects.add(multiRoute);
	
	return multiRoute;
}






function removeGeoObject(geoObj) {
	if (DEV_MOD) {
		console.log ("*** removeGeoObject", Date.now());
	}

	thisMap.geoObjects.remove(geoObj);
}








export {
	thisMap,
	initMap,

	mapSetCenter,
	mapFitToViewport,
	mapSetCenterAndZoom,

	addPlacemark,
	movePlacemark,
	
	addPolyline,
	addMultiRoute,
	
	getDistance,
	getMultiRouteDistance,

	removeGeoObject,
};
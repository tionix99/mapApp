import "./jquery-ui.min.css";
import "./index.css";

/* eslint-disable no-undef */
import React from "react";
import ReactDOM from "react-dom";

/* import * as serviceWorker from "./serviceWorker"; */

import JQuery from "jquery"; 

import "jquery-ui/ui/core";
import "jquery-ui/ui/widgets/resizable";


import {
	initMap, // инициализация карты
	mapFitToViewport // установка карты в размер контейнера

} from "./api/ymap.js";


// eslint-disable-next-line no-unused-vars
import MainPanel from "./components/MainPanel.jsx";

let appContainer= document.getElementById("app-container");
let mapContainer= document.createElement("div"); // карту можно прикрепить и к элементу не прописанному в DOM, 
// что позволяет начать ее инициализацию до того как React отрисует дерево DOM
mapContainer.id= "map-conteiner";


// Возникновение событий загрузки DOM-дерева или документа не сигнализирует об окончании загрузки API ymaps. 
// То есть использование обработчиков событий типа document.ready, window.onload, jQuery.ready и пр. не позволяет определить, 
// готовы ли компоненты для использования.

// Функция ymaps.ready исполняет включенный в нее код после того, как будет загружены компоненты API и DOM-дерево документа.
// Так как компоненты React используют API ymaps то MainWindow загружается по событию ymaps.ready


ymaps.ready(function() {
	// создаем карту и прикреплем ее к mapContainer
	initMap(mapContainer, appContainer);

	ReactDOM.render(
		<div
			id= "main-window"
		>
			<MainPanel />
			<div id= "map-container"></div>

		</div>,
		
		appContainer,
		
		function() {
			if (process.env.NODE_ENV=== "development") {
				console.log ("MainPanel mount", Date.now());
			}

			// с помощью JQuery делаем контенер приложения изменяемого размера
			JQuery(appContainer).resizable({
				minWidth: 240,
				minHeight: 240,

				// при окончании изменнения размера контейнера приложения будет производится перерасчет размера карты 
				stop: function() {
					mapFitToViewport();

				}
			});

			// заменяем созданный реактом элемент map-container элементом mapContainer к которому initMap уже прикрепил карту
			
			// суть этого действия  -
			// это позволяет инициализировать карту и ее api до того как React отрисует ее контейнер "map-container"
			// что дает компонентам использовать api карты в своих конструкторах (т.е. до того как будет отрисован элемент "main-window")

			// можно было бы просто вывести "map-container" из рендера React например так:
			// но это усложняет компоновку блоков приложения и нарушает его целостность
			// appContainer.innerHTML= `
			//	<div id= "main-window">
			//		<div id= "react-container"></div>
			//		<div id= "map-container"></div>
			//	</div>
			//`

			
			JQuery("#map-container").replaceWith(mapContainer);
			mapFitToViewport();

		}
	);
}); 


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
/* serviceWorker.unregister(); */

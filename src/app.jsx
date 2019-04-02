// переменная DEV_MOD вводится webpack, в webpack.dev_map она true, в webpack.build_min - false,
// таким образом при минификации  сообщения console.log в условии DEV_MOD  вырезаются

import "./jquery-ui.min.css";
import "./app.css";



if (DEV_MOD) {
	console.log("app load", Date.now());
}

// eslint-disable-next-line no-unused-vars
import React from "react";

/* const ReactDOM= require("react-dom"); */

import ReactDOM from "react-dom";



import JQuery from "jquery"; 

import "jquery-ui/ui/core";
import "jquery-ui/ui/widgets/resizable";



import {
	initMap, // инициализация карты
	mapFitToViewport // установка карты в размер контейнера
} from "./api/ymap.js";


// eslint-disable-next-line no-unused-vars
import MainPanel from "./components/MainPanel.jsx";

// eslint-disable-next-line no-unused-vars
import { Provider } from "react-redux";

/* import AppProvider from "./AppProvider.jsx"; */
import { CREATE_STORE } from "./data/storeOperations.js";

let appContainer= document.getElementById("app-container");
let mapContainer= document.createElement("div"); // карту можно прикрепить и к элементу не прописанному в DOM, 
// что позволяет начать ее инициализацию до того как React отрисует дерево DOM
mapContainer.id= "map-conteiner";


// Возникновение событий загрузки DOM-дерева или документа не сигнализирует об окончании загрузки API ymaps. 
// То есть использование обработчиков событий типа document.ready, window.onload, jQuery.ready и пр. не позволяет определить, 
// готовы ли компоненты для использования.

// Функция ymaps.ready исполняет включенный в нее код после того, как будет загружены компоненты API и DOM-дерево документа.
// Так как компоненты React используют API ymaps то MainPanel загружается по событию ymaps.ready


ymaps.ready(function() {
	// создаем карту и прикреплем ее к mapContainer
	initMap(mapContainer, appContainer);
	// запускаем redux хранилище
	let store= CREATE_STORE(); 

	// Чтобы связать хранилище и компонент, применяется провайдер - класс Provider из пакета "react-redux".
	//  У провайдера устанавливается объект хранилища через свойство store: <Provider store={store}>. 
	ReactDOM.render(
		<div
			id= "main-window"
		>
			<Provider 
				store= {store}
			>
				<MainPanel />
				
			</Provider>

			<div id= "map-container"></div>

		</div>,
		
		appContainer,
		
		function() {
			if (DEV_MOD) {
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
		
			// appContainer.innerHTML= `
			//	<div id= "main-window">
			//		<div id= "react-container"></div>
			//		<div id= "map-container"></div>
			//	</div>
			//`

			// но это усложняет компоновку блоков приложения и нарушает его целостность
			JQuery("#map-container").replaceWith(mapContainer);
			mapFitToViewport();

		}
	);
}); 







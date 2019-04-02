if (DEV_MOD) {
	console.log("CoordPanel load", Date.now());
}
import "./CoordPanel.css";

// eslint-disable-next-line no-unused-vars
import React from "react";

import { connect } from "react-redux";
import actions from "../data/actions.js";


// eslint-disable-next-line no-unused-vars
import DropSelectList from "./DropSelectList.jsx"; // выпадающий список

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



function CoordPanel(props) {
	if (DEV_MOD) {
		console.log (
			"CoordPanel render", 
			/* this.props, */
			Date.now()
		);
	}

	return <div>
		<ul
			className= "str"
		>	
			<li>
				<button
					className= {props.autozoom}
					onClick= {props.clickAutozoom} 
				>
						автозум
				</button>
				<button
					className= {props.multiroute}
					onClick= {props.clickMultiroute}
				>
						маршрут
				</button>
			</li>

			<DropSelectList 
				label= "формат"
				buttons= {formatButtons} //если определять массивы функции и объекты внутри компонента то они будут пересоздаваться при каждом обновлении, следует избегать этого

				setting= {props.format}

				extClick= {props.changeFormat}
			/>
			
			<DropSelectList 
				label= "шаг"
				buttons= {stepButtons}
					
				setting= {props.step}

				extClick= {props.changeStep}
			/>
				
		</ul>
			
		<PlacemarkList // компонент отображающий координаты установленных меток
			step= {props.step}
			format= {props.format}
		/>

		<DistanceInfo // компонент отображающий информацию о дистанциях
		/>
			

	</div>;

}



const CoordPanelActions= {
	clickAutozoom: actions.clickAutozoom,
	clickMultiroute: actions.clickMultiroute,

	changeFormat: actions.changeFormat,
	changeStep: actions.changeStep
};



export default connect(
	function(state) {
		/* let formSet= state.get("formSet");

		return { 
			autozoom: formSet.autozoom,
			multiroute: formSet.multiroute,
			format: formSet.format,
			step: formSet.step,
		}; */

		return Object.assign({}, state.get("formSet"));

	},

	CoordPanelActions //  набор действий, которые вызываются в компоненте MainPanel или в его дочерних компонентах. И опять же эти действия после этого мы сможем получить в компоненте MainPanel через значения this.props
)(CoordPanel);


if (DEV_MOD) {
	console.log("DistanceInfo load", Date.now());
}

import React from "react";
import { connect } from "react-redux";

import {
	mapFitToViewport, // установка карты в размер контейнера
} from "../api/ymap.js";


class DistanceInfo extends React.Component { // компонент отображающий информацию о дистанциях
	constructor(props) {
		super(props);
		
		this.strings= 0;

		this.renderFunc= (multiRoute)=> {
			if (multiRoute.length=== 0) {
				return <li>
					Маршрут не найден
				</li>;

			} else {
				return multiRoute.map((distance, i)=> {
					return <li 
						key= {i} 
					>
						Маршрут {i+ 1}: {distance}
					</li>;
				});
			}
		};
	}

	

	componentDidUpdate() {
		if (this.strings!== this.props.multiRoute.length) { // если изменилось количество отображаемых строк - подгоняем карту
			// eslint-disable-next-line no-undef
			if (DEV_MOD) {
				console.log("DistanceInfo update", Date.now());
			}
			
			mapFitToViewport();
			this.strings= this.props.multiRoute.length;
		}
	}

	render() {
		if (DEV_MOD) {
			console.log (
				"DistanceInfo render", 
				/* this.props.placemark.label, */
				Date.now()
			);
		}

		return <ul>
			<li>
				Минимальное расстояние: {this.props.polylineRoute} км.
			</li>
			
			{
				this.renderFunc(this.props.multiRoute)
			}
			
		</ul>;
	}
}



export default connect(
	function(state) {
		return Object.assign({}, state.get("distanceInfo"));
	},
	false
)(DistanceInfo);


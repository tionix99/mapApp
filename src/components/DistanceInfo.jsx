
if (DEV_MOD) {
	console.log("DistanceInfo load", Date.now());
}

import React from "react";


import {
	mapFitToViewport, // установка карты в размер контейнера
} from "../api/ymap.js";


class DistanceInfo extends React.Component { // компонент отображающий информацию о дистанциях
	constructor(props) {
		super(props);
		
		this.routes= 0;

		this.renderFunc= (multiDistance)=> {
			if (multiDistance.length=== 0) {
				return <li>
					Маршрут не найден
				</li>;

			} else {
				return multiDistance.map((distance, i)=> {
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
		if (this.routes!== this.props.multiDistance.length) { // если изменилось количество отображаемых строк - подгоняем карту
			// eslint-disable-next-line no-undef
			if (DEV_MOD) {
				console.log("DistanceInfo update", Date.now());
			}
			
			mapFitToViewport();
			this.routes= this.props.multiDistance.length;
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
				Минимальное расстояние: {this.props.shortDistance} км.
			</li>
			
			{
				this.renderFunc(this.props.multiDistance)
			}
			
		</ul>;
	}
}

	






export default DistanceInfo;
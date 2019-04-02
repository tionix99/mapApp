

function changeFormat(btn) {
	if (DEV_MOD) {
		console.log (
			"!!! changeFormat", 
			Date.now()
		);
	}

	return {
		type: "CHANGE_FORMAT",
		format: btn.lbl
	};
}

function changeStep(btn) {
	if (DEV_MOD) {
		console.log (
			"!!! changeStep", 
			Date.now()
		);
	}

	return {
		type: "CHANGE_STEP",
		step: btn.lbl
	};
}

function clickAutozoom(e) {
	if (DEV_MOD) {
		console.log (
			"!!! clickAutozoom", 
			Date.now()
		);
	}

	return {
		type: "CLICK_AUTOZOOM",
		e
	};
}

function clickMultiroute(e) {
	if (DEV_MOD) {
		console.log (
			"!!! clickMultiroute", 
			Date.now()
		);
	}

	return {
		type: "CLICK_MULTIROUTE",
		e
	};

}

function centerPlacemark(placemark) {
	if (DEV_MOD) {
		console.log (
			"!!! centerPlacemark", 
			Date.now()
		);
	}

	return {
		type: "CENTER_PLACEMARK",
		placemark
	};
}





function deletePlacemark(placemark) {
	if (DEV_MOD) {
		console.log (
			"!!! deletePlacemark", 
			Date.now()
		);
	}

	return {
		type: "DELETE_PLACEMARK",
		placemark
	};
}


function inputCoords(placemark) {
	if (DEV_MOD) {
		console.log (
			"!!! inputCoords", 
			Date.now()
		);
	}

	return {
		type: "INPUT_COORDS",
		placemark
	};
}






export default {
	clickAutozoom,
	clickMultiroute, 

	changeFormat,
	changeStep,

	centerPlacemark,
	deletePlacemark,

	inputCoords,

};
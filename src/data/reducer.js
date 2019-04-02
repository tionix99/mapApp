import { 
	INITIAL_STATE,
	
	CLICK_AUTOZOOM,
	CLICK_MULTIROUTE,

	CHANGE_STEP,
	CHANGE_FORMAT,

	CREATE_PLACEMARK,
	CENTER_PLACEMARK,
	MOVE_PLACEMARK,
	DELETE_PLACEMARK,

	INPUT_COORDS,
	
	CHANGE_MULTIROUTE,

	
} from "./storeOperations";


function reducer(
	state= INITIAL_STATE(), 
	action 
) {

	switch (action.type) {

	case "CLICK_AUTOZOOM":
		return CLICK_AUTOZOOM(state, action.e);
	
	case "CLICK_MULTIROUTE":
		return CLICK_MULTIROUTE(state, action.e);
	

	case "CHANGE_FORMAT":
		return CHANGE_FORMAT(state, action.format);

	case "CHANGE_STEP":
		return CHANGE_STEP(state, action.step);
	

	case "CREATE_PLACEMARK":
		return CREATE_PLACEMARK(state, action.e);
	
	case "CENTER_PLACEMARK":
		return CENTER_PLACEMARK(state, action.placemark);


	case "MOVE_PLACEMARK":
		return MOVE_PLACEMARK(state, action.placemark);

	case "DELETE_PLACEMARK":
		return DELETE_PLACEMARK(state, action.placemark);


	case "INPUT_COORDS":
		return INPUT_COORDS(state, action.placemark);
	
	
	case "CHANGE_MULTIROUTE":
		return CHANGE_MULTIROUTE(state, action.distance);
	
	}
	
	return state; 
}

export default reducer;
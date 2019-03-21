
if (DEV_MOD) {
	console.log("MainPanel load", Date.now());
}

// eslint-disable-next-line no-unused-vars
import React from "react";
// eslint-disable-next-line no-unused-vars
import CoordPanel from "./CoordPanel.jsx"; 



// в данном случае наличие MainPanel (тк вложенный элемент один) избыточно а вообще позволяет удобно компоновать вложенные панели
function MainPanel() { 
	if (DEV_MOD) {
		console.log (
			"MainPanel render", 
			Date.now()
		);
	}


	return <div>
		<CoordPanel />
		
	</div>;
}


export default MainPanel;
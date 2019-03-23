



import React from "react";

import CoordPanel from "./CoordPanel.jsx"; 

if (process.env.NODE_ENV=== "development") {
	console.log("MainPanel load", Date.now());
}

// в данном случае наличие MainPanel (тк вложенный элемент один) избыточно а вообще позволяет удобно компоновать вложенные панели
function MainPanel() { 
	if (process.env.NODE_ENV=== "development") {
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
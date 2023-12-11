import React from "react";
import './App.css';
import './../dist/output.css';
import Home from './Home.js';
import Glance from './Glance.js';
import {
	createBrowserRouter,
	RouterProvider
} from "react-router-dom"



const App = () =>{
	
	const router = createBrowserRouter([
		{
			path:"/",
			element: <Home />
		},
		{
			path:"/glance/:ds",
			element: <Glance />
		},
	])

    	return (
		<RouterProvider router={router}/>
    	)
}

export default App


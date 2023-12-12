
import React from 'react';
import { useRef, Suspense } from 'react';
import {dexdb} from '../util/db';
import {useParams} from 'react-router-dom';
import {PathConstants} from './pathConstants';
import {Link} from 'react-router-dom';


function Loading(){
	return <h1>Loading</h1>
}

export default function Glance(){
	let {ds}=useParams();
	let [dsname, setDsname] = React.useState(ds)
	let [tableData, setTableData ] = React.useState({currentFile:"",  kaggleAuthor:"", kaggleDsname:"", tableWidth:800, currentHeaders:[], csvData:[], allFiles:[]})
	let [pagination, setPagination] = React.useState({limit:50, page:1, nu:100})

	React.useEffect( () => {
		(async () => {
			const datasetInfo = await dexdb.datasetInfo.filter((item)=> { return item.name==dsname} ).toArray()
			const csvHeaders = await dexdb.headersArray.filter((item)=> { return item.dsname==dsname}).toArray()
			const csvFilenames = csvHeaders.map((item)=> item.fname)
			const initialFile= csvFilenames[0]
			const totalObjects = (await dexdb.csvObjects.filter((item)=> item.fname==initialFile ).toArray()).length
			const csvData = await dexdb.csvObjects.filter((item)=> item.fname==initialFile ).limit(50).toArray()
			const currentHeaders = csvHeaders.filter((item) => { return item.fname == initialFile } )[0].headers;
			setPagination({limit:pagination.limit, page:pagination.page, nu:totalObjects})

			setTableData({
				currentFile:initialFile, 
				currentHeaders:currentHeaders,
				tableWidth:currentHeaders.length*100,
				csvData:csvData,
				allFiles: csvFilenames,
				kaggleAuthor:datasetInfo[0].kaggleAuthor,
				kaggleDsname:datasetInfo[0].kaggleDsName
			})
		})()
	}, [])


	function HumanReadableHeader(headerString){
		const shortenre = /(?<=\/?)[a-zA-Z0-9-_\s\.]+$/
		const lowercased =  (shortenre.exec(headerString)+'').replaceAll(/[-_]+/g, " ")
		const titledcased = lowercased.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
		return titledcased
	}

	function Human(headerString){
		return HumanReadableHeader(headerString)
	}

	function HumanCell(cellString){
		if (!cellString) return cellString;
		if (cellString.length > 30 ) return cellString.slice(30);
		return cellString;
	}

	function loadFile(event){
		( async () => {
			const initialFile = event.target.value;
			const csvData = await dexdb.csvObjects.filter((item)=> item.fname==initialFile ).limit(50).toArray()
			const csvHeaders = await dexdb.headersArray.filter((item)=> { return item.dsname==dsname}).toArray()
			const currentHeaders = csvHeaders.filter((item) => { return item.fname == initialFile } )[0].headers;
			setPagination({limit:50, page:1, nu:csvData.length})
			setTableData({
				currentFile:initialFile, 
				currentHeaders:currentHeaders,
				tableWidth:currentHeaders.length*100,
				csvData:csvData,
				allFiles: tableData.allFiles,
				kaggleAuthor:tableData.kaggleAuthor,
				kaggleDsname:tableData.kaggleDsname
			})
		})()

	}

	var int = parseInt;

	function changePage(event){
		( async () => {
			let limit = int(pagination.limit);
			let offset = ( int(event.target.value) - 1 )*limit;
			const csvData = await dexdb.csvObjects.filter((item)=> item.fname==tableData.currentFile ).offset(offset).limit(limit).toArray()
			setPagination({limit: limit, page:int(event.target.value), nu:pagination.nu});
			setTableData({
				currentFile:tableData.currentFile, 
				currentHeaders:tableData.currentHeaders,
				tableWidth:tableData.currentHeaders.length*100,
				csvData:csvData,
				allFiles: tableData.allFiles,
				kaggleAuthor:tableData.kaggleAuthor,
				kaggleDsname:tableData.kaggleDsname
			})
		})(event)
	}

	function changeLimit(event){
		( async () => {
			let limit = int(event.target.value);
			let offset = int(0);
			const csvData = await dexdb.csvObjects.filter((item)=> item.fname==tableData.currentFile ).offset(offset).limit(limit).toArray()
			setPagination({limit: limit, page:int(1), nu:pagination.nu});
			setTableData({
				currentFile:tableData.currentFile, 
				currentHeaders:tableData.currentHeaders,
				tableWidth:tableData.currentHeaders.length*100,
				csvData:csvData,
				allFiles: tableData.allFiles,
				kaggleAuthor:tableData.kaggleAuthor,
				kaggleDsname:tableData.kaggleDsname
			})
		})(event)
	}


	return (
		<>
		<div className="h-screen justify-center">
		<div className="grid grid-cols-1 w-full">
		<div className="flex">
		<div className="flex flex-row navbarGlance">
		<Link className="basis-[50%] mx-1 py-4 text-white bg-gray-700 hover:bg-lime-800 focus:ring-4 focus:outline-none focus:ring-lime-300 rounded-lg text-xl w-64 h-16 text-center cursor-pointer active:translate-y-2  active:[box-shadow:0_0px_0_0_#021e4a,0_0px_0_0_#252628] active:border-b-[0px] transition-all duration-150 [box-shadow:0_10px_0_0_#021e4a,0_15px_0_0_#252628] border-b-[1px] border-black-400" to={`${PathConstants.HOME}`}>Home</Link>
		</div>
		<Suspense fallback={<Loading/>}>
		<div className="flex flex-row ">
		<table width={tableData.tableWidth+'px'} className="table-fixed border-collapse border border-slate-400">
		<caption className="caption-top">
		{ tableData.kaggleAuthor? <h3>{tableData.kaggleAuthor}</h3> : <h3>Author</h3>} / { tableData.kaggleDsname? <h3>{tableData.kaggleDsname}</h3> : <h3>Dataset</h3>} / <div>
		<select defaultValue={tableData.currentFile} name="precollecteddatasets" className="basis-[80%] mx-1 text-white bg-gray-700 hover:bg-lime-800 focus:ring-4 focus:outline-none focus:ring-lime-300 rounded-lg text-xl w-128 mb-10 h-16 text-center cursor-pointer active:translate-y-2  active:[box-shadow:0_0px_0_0_#021e4a,0_0px_0_0_#252628] active:border-b-[0px] transition-all duration-150 [box-shadow:0_10px_0_0_#021e4a,0_15px_0_0_#252628] border-b-[1px] border-black-400" onChange={loadFile}>
		{ 
			tableData.allFiles && tableData.allFiles.map((item, index) => {
					return <option value={item} key={index}>{item}</option>
			})
		}

		</select>
		</div>
		<div>
		<h4>Showing first <select className="text-white bg-gray-700 hover:text-teal-400" name="selectlimit" defaultValue={pagination.limit} onChange={changeLimit}>
					<option value="10" className="hover:text-xl">10</option>
					<option value="25">25</option>
					<option value="50">50</option>
					<option value="100">100</option>
					<option value="200">200</option>
		</select>
		records at page <select className="text-white bg-gray-700 hover:text-teal-300" name="selectpage" defaultValue={pagination.page} onChange={changePage}>
		{ 
			[...Array(int(Math.max(5,int(pagination.nu/pagination.limit)))).keys()].map( (item,index) => {
				return <option key={index} value={item+1}>{item+1}</option>
			})
		}
		</select>
 </h4>
		</div>
		</caption>
		<thead>
		<tr>
		{
			tableData.currentHeaders.length && tableData.currentHeaders.map( (item, index) => {
				if (item.length > 15 )
					return <td key={index} className="text-sm code">{item}</td>
						else return <td key={index} className="text-sm code">{item}</td> 
			})
		}
		</tr>
		<tr>
		{
			tableData.currentHeaders.length && tableData.currentHeaders.map( (item, index) => {
				if (item.length > 15 )
					return <th key={index} className="text-sm">{Human(item)}</th>
				else return <th key={index} className="text-md">{Human(item)}</th>
			})
		}
		</tr>
		</thead>
		<tbody>
		{
			tableData.csvData.length && tableData.csvData.map( (item, index) => {
					return (
						<tr key={index}>
						{ 
							tableData.currentHeaders.map((hitem, index) =>{
								return (<td key={index} className={isNaN(item[hitem])? "text-left" : "text-right"}>
									{HumanCell(item[hitem])}
									</td>)

							}) 
						}
						</tr>
					)
			})
		}
		</tbody>
		</table>
		</div>
		</Suspense>
		</div>
		</div>
		</div>
		</>
	)
}

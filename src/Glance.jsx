
import React from 'react';
import { useRef } from 'react';
import {dexdb} from '../util/db';
import {useParams} from 'react-router-dom';
import {PathConstants} from './pathConstants';
import {Link} from 'react-router-dom';

export default function Glance(){
	let {ds}=useParams();
	let [dsname, setDsname] = React.useState(ds)
	let [tableData, setTableData ] = React.useState({currentFile:"",  kaggleAuthor:"", kaggleDsname:"", tableWidth:800, currentHeaders:[], csvData:[]})

	React.useEffect( () => {
		(async () => {
		const datasetInfo = await dexdb.datasetInfo.filter((item)=> { return item.name==dsname} ).toArray()
		const csvHeaders = await dexdb.headersArray.filter((item)=> { return item.dsname==dsname}).toArray()
		const csvFilenames = csvHeaders.map((item)=> item.fname)
		const initialFile= csvFilenames[0]
		const csvData = await dexdb.csvObjects.filter((item)=> item.fname==initialFile ).limit(50).toArray()
		const currentHeaders = csvHeaders.filter((item) => { return item.fname == initialFile } )[0].headers;
		setTableData({
			currentFile:initialFile, 
			currentHeaders:currentHeaders,
			tableWidth:currentHeaders.length*100,
			csvData:csvData,
			kaggleAuthor:datasetInfo[0].kaggleAuthor,
			kaggleDsname:datasetInfo[0].kaggleDsname
		})
		})()
	}, [])


	function HumanReadableHeader(headerString){
		const shortenre = /(?<=\/?)[a-zA-Z0-9-_\.]+$/
		const lowercased =  (shortenre.exec(headerString)+'').replaceAll(/[-_]+/g, " ")
		const titledcased = lowercased.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
		return titledcased
	}
	
	function Human(headerString){
		return HumanReadableHeader(headerString)
	}

	function createRowFromObject(Obj_, headers){
		let jsx_ = (<Fragment>);
		for( let i = 0; i< headers.length; i++ ) 
		{
			jsx_ += (<td key={i} >{Obj_[headers[i]]}</td>);
		}
		jsx_ += (</Fragment>);
		return jsx_;
	}

	return (
		<>
		<div className="h-screen justify-center">
		<div className="grid grid-cols-1 w-full">
		<div className="flex">
		<div className="flex flex-row">
		<table width={tableData.tableWidth+'px'} className="table-fixed border-collapse border border-slate-400">
		<caption className="caption-top">
		{dsname}
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

					//const tableRow = item.map( (item, index) => { return (<td key={index}>{item[tableData.currentHeaders[index]]} </td>) })
					const tableRow =<td></td> 
					return (
						<tr key={index}>
						{createRowFromObject(item, tableData.currentHeaders)}
						</tr>
					)
					})
			}
				<tr>
					<td>13</td>
					<td>asdsadasdadadada</td>
					<td>what about love?</td>
					<td>+1231312312312</td>
					<td>....</td>
					
				</tr>
		</tbody>
			</table>
		</div>
		</div>
		</div>
		</div>
		</>
	)
}

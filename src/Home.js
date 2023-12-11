import React from 'react';
import { useRef } from 'react';
import {dexdb} from '../util/db';
import {PathConstants} from './pathConstants';
import {Link, useNavigate} from 'react-router-dom';
import {getPin} from '../util/randompin';

function Home(){
	const inputRef = useRef(null)
	const linkRef = useRef(null)
	let [dbg, setDbg] = React.useState({'toggle':true, 'text':'Paste Kaggle dataset link or choose a cached dataset from below.'})
	let [idbname, setIdbname] = React.useState("")
	let [cachedDs, setCachedDs] = React.useState([])

	let navigate = useNavigate();

	// function componentWillMount(){
	// 	(async () => {
	// 	dexdb.datasetInfo.toArray().then((e)=>{
	// 		setCachedDs(e)
	// 		console.log(e)
	// 	})
	// 	})()
	// }

	React.useEffect( () => {
		(async () => {
			dexdb.datasetInfo.toArray().then((e)=>{
			setCachedDs(e)
		//	navigate("glance/thedevastator_hulupopularshowsdataset_4547")
		})
		})()
	}, [])

	function detectLink(e){
		const re = /kaggle\.com\/datasets\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+/
		let link = e.target.value.match(re)
		if (link && link[0]){
			console.log(link[0])
			// fetch("/api").then( (r) => console.log(r) )
		}
	}

	function disableEnterSubmit(e){
		var keyCode = e.keyCode || e.which;
		if (keyCode === 13) {
			e.preventDefault();
			return false;
		}
	}

	async function fetchDataset(e){
		setDbg({'toggle':true, 'text':'Loading...'})
		const re = /kaggle\.com\/datasets\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+/
		const re_group_slugs = /kaggle\.com\/datasets\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)/ 
		let link = inputRef.current.value.match(re)
		if ( ! link || !link[0] ){
			setDbg({'toggle':true, 'text':'Dataset link invalid?'})
			return
		}

		let slugs = link[0].match(re_group_slugs)
		let userSlug = slugs[1]
		let datasetSlug = slugs[2]
		let datasetName = userSlug+'/'+datasetSlug
		let _idbname = `${userSlug.replace(/[-_]+/g,"")}_${datasetSlug.replace(/[-_]+/g,"")}_${getPin()}`
		let backend ="http://54.146.230.239:3000"
		let res 
		try{
		 	res = await( await fetch(backend+"/api/"+encodeURIComponent(userSlug)+"/"+encodeURIComponent(datasetSlug))).json()
		}
		catch(exception){
			if (exception.name == "NetworkError"){
				setDbg({'toggle':true, 'text':'Dataset link invalid?'})
			}
			return
		}
		if (!res || !res.csvdata.length || !res.csvfilenames.length){
			setDbg({'toggle':true, 'text':'Dataset link invalid?'})
			return
		}

		setDbg({'toggle':true, 'text':'Downloaded. Creating IndexedDB ...'})
		for (let index = 0; index < res.csvdata.length; index++) {
			let csvf = res.csvdata[index]
			console.log(csvf)
			let fname = csvf.filename
			dexdb.csvObjects.bulkAdd( csvf.data.map( item => { item['fname']=fname; item['dsname']=_idbname; return item } ) )
			dexdb.headersArray.add({headers: csvf.headers, fname:fname, dsname:_idbname})
			dexdb.datasetInfo.add({name:_idbname, kaggleAuthor:userSlug, kaggleDsName:datasetSlug})
		}
		setDbg({'toggle':true, 'text':'Dataset stored clientside. Click to continue.'})
		setIdbname(_idbname)
	}

	function loadCachedDataset(event){
		console.log(event.target.value)
		return navigate(`${PathConstants.TABLE}/${event.target.value}`)
	}

	function deleteCache(event){
		(async () => {
			await dexdb.datasetInfo.clear()
			await dexdb.headersArray.clear()
			await dexdb.csvObjects.clear()
			setCachedDs([])
		})()
	}

	//route testing
	//navigate("glance/thedevastator_hulupopularshowsdataset_4547")

	//optionsJsx = <Fragment>;
	//	for ( let i = 0 ; i < cachedDs.length; i++ ) 
	//		optionsJsx += <option value=`${cachedDs[i].name}`>{ `${cachedDs[i].kaggleDsName} by ${cachedDs[i].kaggleAuthor}`}</option>
	//optionsJsx += </Fragment>;

	return(
		<div className="h-screen flex justify-center">
		<div className="grid grid-cols-1 place-content-evenly w-196">
		<div className=" place-content-around">
		<div className="text-6xl">Paste kaggle dataset link</div>
		<div className="flex flex-row w-full mt-5">
		<input ref={inputRef} type="text" name="kaggleDatasetLink" className="code tracking-wide text-xl h-16 border border-yellow-800 text-white-900 rounded-lg caret-pink-500 border-4 block basis-[90%] bg-gray-500" onChange={detectLink} onInput={detectLink}/>
		<button className="basis-[10%] mx-1 text-white bg-gray-700 hover:bg-lime-800 focus:ring-4 focus:outline-none focus:ring-lime-300 rounded-lg text-xl w-32 h-16 text-center cursor-pointer active:translate-y-2  active:[box-shadow:0_0px_0_0_#021e4a,0_0px_0_0_#252628] active:border-b-[0px] transition-all duration-150 [box-shadow:0_10px_0_0_#021e4a,0_15px_0_0_#252628] border-b-[1px] border-black-400" onClick={fetchDataset}>Fetch</button>
		</div>
		<div className="w-full text-center mt-5 h-16 text-xl">{dbg.toggle && dbg.text }</div>
		<div className="w-full h-16 mt-2 flex flex-row items-center">{idbname && <><div className="basis-[40%]"></div><Link ref={linkRef} className="basis-[20%] mx-1 py-4 text-white bg-gray-700 hover:bg-lime-800 focus:ring-4 focus:outline-none focus:ring-lime-300 rounded-lg text-xl w-32 h-16 text-center cursor-pointer active:translate-y-2  active:[box-shadow:0_0px_0_0_#021e4a,0_0px_0_0_#252628] active:border-b-[0px] transition-all duration-150 [box-shadow:0_10px_0_0_#021e4a,0_15px_0_0_#252628] border-b-[1px] border-black-400" to={`${PathConstants.TABLE}/${idbname}`}>Glance</Link></>}</div>
		<div className="w-full h-16 mt-5 flex flex-row items-center">
		<div className="basis-[10%]"></div>
		<select defaultValue="Cached Datasets" name="precollecteddatasets" className="basis-[80%] mx-1 text-white bg-gray-700 hover:bg-lime-800 focus:ring-4 focus:outline-none focus:ring-lime-300 rounded-lg text-xl w-32 h-16 text-center cursor-pointer active:translate-y-2  active:[box-shadow:0_0px_0_0_#021e4a,0_0px_0_0_#252628] active:border-b-[0px] transition-all duration-150 [box-shadow:0_10px_0_0_#021e4a,0_15px_0_0_#252628] border-b-[1px] border-black-400" onChange={loadCachedDataset} >
		<option value="">Cached Datasets</option>
		{ 
			cachedDs.length && cachedDs.map((item, index) => {
					return <option value={item.name} key={index}>{item.kaggleDsName} by {item.kaggleAuthor}</option>
			})
		}

		</select>
		</div>
		<div className="w-full h-16 mt-5 flex flex-row place-content-center">
		<button className="basis-[30%] mx-1 text-white bg-gray-700 hover:bg-lime-800 focus:ring-4 focus:outline-none focus:ring-lime-300 rounded-lg text-xl w-32 h-16 text-center cursor-pointer active:translate-y-2  active:[box-shadow:0_0px_0_0_#021e4a,0_0px_0_0_#252628] active:border-b-[0px] transition-all duration-150 [box-shadow:0_10px_0_0_#021e4a,0_15px_0_0_#252628] border-b-[1px] border-black-400" onClick={deleteCache}>Clear cache</button>
		</div>
		</div>
		</div>
		</div>
	)
}

export default Home

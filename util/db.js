import Dexie from 'dexie';


export const dexdb = new Dexie('kaggleCsv')

dexdb.version(3).stores({
	csvObjects : "++__id",
	headersArray : "++__id",
	datasetInfo : "++__id"
})

dexdb.open()


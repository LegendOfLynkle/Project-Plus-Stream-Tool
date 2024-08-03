import { startGGApiQuery } from "./Querier.js";
import { getJson } from "./File System.mjs";
import { stPath } from "./Globals.mjs";

async function getEventId(eventUrl) {
    var query = `"query": "query getEventId($slug: String) {
	  event(slug: $slug) {
		id
		name
	  }
	}",
	"variables": {
		"slug": "${eventUrl}"
	}`;
    
    var apiKey = getJson(`${stPath.text}/API Keys`).startgg;
    return await startGGApiQuery(query, apiKey);
}

export function eventLinkCallback(){
    
}

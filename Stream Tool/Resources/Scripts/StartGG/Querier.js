export async function startGGApiQuery(body, apikey) {
    const url = "https://api.start.gg/alpha/"
	const response = await fetch(url, {
		method: "POST",
	    body: JSON.stringify(body),
	    headers: {
			"Authorization": `Bearer ${apikey}`,'
		    "Content-Type": "application/json"
	    }
	});
    return response;
}

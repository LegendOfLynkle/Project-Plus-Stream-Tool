export async function ausSmashRequest(query, apikey) {
  const url = `https://api.ausmash.com.au/${query}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-ApiKey": apikey,
      "Accept": "application/json",
    },
  });
  return response;
}

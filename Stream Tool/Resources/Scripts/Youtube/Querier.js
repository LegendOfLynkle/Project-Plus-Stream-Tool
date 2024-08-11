export async function youtubeDataAPIRequest(query, apikey) {
  const url = `https://www.googleapis.com/youtube/v3/${query}&key=${apikey}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });
  return response;
}

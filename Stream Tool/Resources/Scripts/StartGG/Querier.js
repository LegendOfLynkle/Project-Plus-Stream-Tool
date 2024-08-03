export async function startGGApiQuery(query, variables, apikey) {
  const url = "https://api.start.gg/gql/alpha";
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify({
      query: query,
      variables: variables
    }),
    headers: {
      Authorization: `Bearer ${apikey}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
  });
  return response;
}

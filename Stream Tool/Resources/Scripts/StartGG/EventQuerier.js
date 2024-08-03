import { startGGApiQuery } from "./Querier.js";
import { settings } from "../Gui/Settings.mjs";
import { debounce } from "../Debounce.js";

async function getEventId(eventUrl) {
  let query = `query getEventId($slug: String) {
        event(slug: $slug) {
          id
          name,
          tournament{
            id
            name
          }
          phases {
            id
            name
          }
        }
      }`;
  let variables = {
    slug: eventUrl
  }

  let apiKey = settings.getStartGGAPIKey();
  return await startGGApiQuery(query, variables, apiKey);
}

export const eventLinkCallback = debounce((x) => {
  getEventId(x.target.value).then((res) => {
    res.json().then((data) => {
      var d = data.data;
      settings.startgg.eventId = d.event.id;
      settings.startgg.eventName = d.event.name;
      settings.startgg.tournamentId = d.event.tournament.id;
      settings.startgg.tournamentName = d.event.tournament.name;
      settings.startgg.phases = d.event.phases;
      settings.saveStartGGSettings();
    })
  });
});

import { startGGApiQuery } from "./Querier.js";
import { settings } from "../Gui/Settings.mjs";
import { debounce } from "../Debounce.js";

export async function getPlayerInformation(id) {
  let query = `query Players($playerId: ID!) {
        player(id: $playerId) {
          id
          gamerTag
          prefix
          user {
            id
            genderPronoun
            authorizations {
              type
              externalUsername
            }
          }
        }
      }`;
  let variables = {
    playerId: id
  }

  let apiKey = settings.getStartGGAPIKey();
  return await startGGApiQuery(query, variables, apiKey);
}

// export const eventLinkCallback = debounce((x) => {
//   getEventId(x.target.value).then((res) => {
//     res.json().then((data) => {
//       var d = data.data;
//       settings.startgg.eventId = d.event.id;
//       settings.startgg.eventName = d.event.name;
//       settings.startgg.tournamentId = d.event.tournament.id;
//       settings.startgg.tournamentName = d.event.tournament.name;
//       settings.startgg.phases = d.event.phases;
//       settings.saveStartGGSettings();
//     })
//   });
// });

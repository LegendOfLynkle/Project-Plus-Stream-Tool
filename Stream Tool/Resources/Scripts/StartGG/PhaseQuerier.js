import { startGGApiQuery } from "./Querier.js";
import { settings } from "../GUI/Settings.mjs";
import { debounce } from "../Debounce.js";
import { updateFullBracket } from "../GUI/Bracket.mjs";

async function getPhaseSets(phaseId) {
  let query = `query PhaseSets($phaseId: ID!, $page: Int!, $perPage: Int!) {
    phase(id: $phaseId) {
      id
      name
      sets(
        page: $page
        perPage: $perPage
        sortType: STANDARD
      ){
        pageInfo {
          total
        }
        nodes {
          id
          fullRoundText
          games {
            id
            entrant1Score
            entrant2Score
          }
          slots {
            id
            seed {
              seedNum
            }
            standing {
              stats {
                score {
                  value
                }
              }
            }
            entrant {
              id
              name
            }
          }
        }
      }
    }
  }`;
  let variables = {
    phaseId: phaseId,
    page: 1,
    perPage: 20
  }

  let apiKey = settings.getStartGGAPIKey();
  return await startGGApiQuery(query, variables, apiKey);
}

const blankPlayerData = {
  name: "-",
  tag: "",
  state: "",
  character: "None",
  skin: "-",
  iconSrc: "",
  score: "-",
};
const bracketData = {
  WinnersSemis: [],
  WinnersFinals: [],
  GrandFinals: [],
  TrueFinals: [],
  LosersTop8: [],
  LosersQuarters: [],
  LosersSemis: [],
  LosersFinals: [],
};


export const startGGSyncButtonCallback = debounce(() => {
  let phase = settings.getStartGGPhase();
  if(phase !== null){
    getPhaseSets(phase.id).then((res) => {
      res.json().then((data) => {
        let d = data.data;
        // Standard ordering from Start.GG should give us everything in order from GF onwards...
        // There will be 11 items that we care about if there is a grand final reset...
        let sets = d.phase.sets.nodes.slice(0, 11);
        sets.forEach((x) => {
          switch(x.fullRoundText){
            case "Grand Final":
              bracketData.GrandFinals = bracketData.GrandFinals.concat(x.slots.map((y) => procsesSetNode(y)));
              break;
            case "Grand Final Reset":
              bracketData.TrueFinals = bracketData.TrueFinals.concat(x.slots.map((y) => procsesSetNode(y)));
              break;
            case "Winners Final":
              bracketData.WinnersFinals = bracketData.WinnersFinals.concat(x.slots.map((y) => procsesSetNode(y)));
              break;
            case "Losers Final":
              bracketData.LosersFinals = bracketData.LosersFinals.concat(x.slots.map((y) => procsesSetNode(y)));
              break;
            case "Losers Semi-Final":
              bracketData.LosersSemis = bracketData.LosersSemis.concat(x.slots.map((y) => procsesSetNode(y)));
              break;
            case "Winners Semi-Final":
              bracketData.WinnersSemis = bracketData.WinnersSemis.concat(x.slots.map((y) => procsesSetNode(y)));
              break;
            case "Losers Quarter-Final":
              bracketData.LosersQuarters = bracketData.LosersQuarters.concat(x.slots.map((y) => procsesSetNode(y)));
              break;
            default: 
              if(bracketData.LosersTop8.length < 4){
                bracketData.LosersTop8 = bracketData.LosersTop8.concat(x.slots.map((y) => procsesSetNode(y)));
              }
              break;
          }
        });
        if(bracketData.TrueFinals.length == 0){
          bracketData.TrueFinals = [blankPlayerData, blankPlayerData ];
        }
        updateFullBracket(bracketData);
      });
    });
  }else{
    console.log("Could not find phase.")
  }
});

function procsesSetNode(slot) {
  let entry = JSON.parse(JSON.stringify(blankPlayerData)); // Deep copy the player template
  if(slot.entrant.name.includes("|")){
    let parts = slot.entrant.name.split("|");
    entry.tag = parts[0].trim();
    entry.name = parts[1].trim();
  }else{
    entry.name = slot.entrant.name;
  }
  entry.score = slot.standing.stats.score.value;
  return entry;
}

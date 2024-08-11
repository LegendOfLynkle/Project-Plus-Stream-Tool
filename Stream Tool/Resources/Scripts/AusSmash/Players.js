import { settings } from "../Gui/Settings.mjs";
import { debounce } from "../Debounce.js";
import { ausSmashRequest } from "./Requester.js";
import { profileInfo } from "../GUI/Profile Info.mjs";
import { handle } from "../Unpack.js";
import { tryGetChannelName } from "../Youtube/Channel.js"

async function searchAusSmashPlayers(searchTerm) {
  let path = `players/search?q=${encodeURIComponent(searchTerm)}`;
  let apiKey = settings.getAusSmashAPIKey();
  return await ausSmashRequest(path, apiKey);
}

async function getAusSmashPlayer(id){
  let path= "players/" + id;
  let apiKey = settings.getAusSmashAPIKey();
  return await ausSmashRequest(path, apiKey);
}

function getCurrentIds(){
  const ids = [];
  let items = document.getElementById("aussmashPlayers").children;
  for(let ii = 0; ii < items.length; ii++){
    ids.push(items[ii].value);
  }
  return ids;
}

var aussmashPlayers = [];

export const ausSmashPlayerSearchCallback = debounce((x) => {
  if(x.target.value == '') return;
  var currentIds = getCurrentIds();
  if(currentIds.includes(x.target.value)){
    getAusSmashPlayer(x.target.value).then((res) => handle(res, (d) => {
      profileInfo.setName(d.Name)
      profileInfo.setState(d.Region.Name);
      setTwitter(d.TwitterUrl);
      setTwitch(d.TwitchUrl);
      setYoutube(d.YouTubeUrl);
      setStartGG(d.SmashGGPlayerID);
    }));
  }else{
    searchAusSmashPlayers(x.target.value).then((res) => {
      res.json().then((data) => {
        aussmashPlayers = data;
        let playerList = document.getElementById("aussmashPlayers");
        playerList.innerHTML = null;
        data.forEach((item) => {
          playerList.appendChild(new Option(`(${item.RegionShort}) ${item.Name}`, item.ID))
        });
      })
    });
  }
}, 1000);


let search = document.getElementById("pInfoInputAusSmashSearch")
document.getElementById("pInfoInputAusSmashSearch").addEventListener("keyup", ausSmashPlayerSearchCallback);

export function aussmashInit() {
  console.log("ahhhh");
}

function setTwitch(value){
  if(value !== null){
    profileInfo.setTwitch(value.split("/").slice(-1));
  }
}

function setTwitter(value){
  if(value !== null){
    profileInfo.setTwitter(value.split("/").slice(-1));
  }
}

function setYoutube(value){
  if(value !== null){
    let channelId = value.split("/").slice(-1);
    tryGetChannelName(channelId).then((res) => handle(res, (d) => {
      if(d.items.length !== 0 && d.items[0]?.snippet?.customUrl !== "" && d.items[0]?.snippet?.customUrl !== null){
        profileInfo.setYt(d.items[0]?.snippet?.customUrl);
      }
    }));
  }
}

function setStartGG(value){
  if(value !== null){
    profileInfo.setStartGG(value);
  }
}

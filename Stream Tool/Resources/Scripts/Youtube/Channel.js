import { settings } from "../Gui/Settings.mjs";
import { youtubeDataAPIRequest } from "./Querier.js";

export async function tryGetChannelName(channelId) {
  let path = `channels?id=${channelId}&part=snippet`
  let apiKey = settings.getYTDataAPIKey();
  return await youtubeDataAPIRequest(path, apiKey);
}

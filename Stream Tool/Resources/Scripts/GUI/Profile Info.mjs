import { getJson, saveJson } from "./File System.mjs";
import { viewport } from "./Viewport.mjs";
import { displayNotif } from "./Notifications.mjs";
import { stPath } from "./Globals.mjs";
import { playerFinder } from "./Finder/Player Finder.mjs";
import { commFinder } from "./Finder/Comm Finder.mjs";
import { settings } from "./Settings.mjs";
import { getPlayerInformation } from "../StartGG/PlayerQuerier.js";
import { handle } from "../Unpack.js";

const flagList = await getJson(stPath.text + "/Flag Names");

class ProfileInfo {
  #pInfoDiv = document.getElementById("pInfoDiv");

  #pTypeSpan = document.getElementById("pInfoType");

  #inputs = document.getElementsByClassName("pInfoInput");

  #pronounsInp = document.getElementById("pInfoInputPronouns");
  #tagInp = document.getElementById("pInfoInputTag");
  #nameInp = document.getElementById("pInfoInputName");
  #flagSelect = document.getElementById("pInfoInputState");
  #twitchInp = document.getElementById("pInfoInputTwitch");
  #ytInp = document.getElementById("pInfoInputYt");
  #twitterInp = document.getElementById("pInfoInputTwitter");
  /*  #bskyInp = document.getElementById("pInfoInputBsky");
        #mastoInp = document.getElementById("pInfoInputMasto");
        #cohostInp = document.getElementById("pInfoInputCohost");*/
  #startGG = document.getElementById("pInfoInputStartGG");
  #startGGUser = document.getElementById("pInfoInputStartGGUserId");
  #startGGDiscriminator = document.getElementById("pInfoInputStartGGDiscriminator");
  #aussmash = document.getElementById("pInfoInputAusSmashSearch");

  #curProfile;

  constructor() {
    document.getElementById("pInfoBackButt").addEventListener("click", () => {
      this.hide();
    });
    document.getElementById("pInfoSaveButt").addEventListener("click", () => {
      this.apply();
      this.savePreset();
      this.hide();
    });
    document.getElementById("pInfoApplyButt").addEventListener("click", () => {
      this.apply();
      this.hide();
    });

    // create the flag select list
    for (let i = 0; i < flagList.length; i++) {
      const flagOption = document.createElement("option");
      flagOption.value = flagList[i].name;
      flagOption.innerHTML = flagList[i].name;

      // add colors to the list
      flagOption.style.backgroundColor = "var(--bg5)";

      this.#flagSelect.appendChild(flagOption);
    }

    // add in additional none option
    const noneOption = document.createElement("option");
    noneOption.value = "";
    noneOption.innerHTML = "(none)";
    noneOption.style.backgroundColor = "var(--bg5)";
    this.#flagSelect.appendChild(noneOption);
  }

  /**
   * Checks if the player info menu is currently visible
   * @returns True if menu is visible, false if not
   */
  isVisible() {
    return this.#pInfoDiv.style.pointerEvents == "auto";
  }

  /**
   * Displays the player info div on screen
   * @param {PlayerGame} profile Player data to fill inputs
   */
  show(profile) {
    // update player number text
    this.#pTypeSpan.textContent = profile.profileType;

    // display the current info for this player
    this.#pronounsInp.value = profile.getPronouns();
    this.#tagInp.value = profile.getTag();
    this.#nameInp.value = profile.getName();
    this.#flagSelect.value = profile.getState();
    const socials = profile.getSocials() || [];
    this.#twitterInp.value = socials.twitter || "";
    this.#twitchInp.value = socials.twitch || "";
    this.#ytInp.value = socials.yt || "";
    this.#startGG.value = profile.integrations?.startgg?.player_id || "";
    this.#aussmash.value = profile.integrations?.aussmash || "";
    /*      this.#bskyInp.value = socials.bsky || "";
                this.#mastoInp.value = socials.masto || "";
                this.#cohostInp.value = socials.cohost || "";*/

    // give tab index so we can jump from input to input with the keyboard
    this.#setTabIndex(0);

    // display the overall div
    this.#pInfoDiv.style.pointerEvents = "auto";
    this.#pInfoDiv.style.opacity = 1;
    this.#pInfoDiv.style.transform = "scale(1)";
    viewport.opacity(".25");

    // store current class for later
    this.#curProfile = profile;
  }

  /** Hides the player info div */
  hide() {
    this.#pInfoDiv.style.pointerEvents = "none";
    this.#pInfoDiv.style.opacity = 0;
    this.#pInfoDiv.style.transform = "scale(1.15)";
    viewport.opacity("1");

    this.#setTabIndex("-1");
  }

  /**
   * Sets a tab index value for all input elements inside the player info div
   * @param {Number} num - Tab index value
   */
  #setTabIndex(num) {
    for (let i = 0; i < this.#inputs.length; i++) {
      this.#inputs[i].setAttribute("tabindex", num);
    }
  }

  /** Updates player data with values from input fields */
  apply() {
    this.#curProfile.pronouns = this.#pronounsInp.value;
    this.#curProfile.setTag(this.#tagInp.value);
    this.#curProfile.setName(this.#nameInp.value);
    this.#curProfile.setState(this.#flagSelect.value);

    const socials = {
      twitter: this.#twitterInp.value,
      twitch: this.#twitchInp.value,
      yt: this.#ytInp.value,
      /*          bsky : this.#bskyInp.value,
                        masto : this.#mastoInp.value,
                        cohost : this.#cohostInp.value,*/
    };
    this.#curProfile.setSocials(socials);
  }

  async savePreset() {
    const game = settings.selectedGame();
    const preset = {
      name: this.#curProfile.getName(),
      tag: this.#curProfile.getTag(),
      pronouns: this.#curProfile.getPronouns(),
      state: this.#curProfile.getState(),
      socials: this.#curProfile.getSocials(),
      integrations: {
        aussmash: null,
        startgg: {
          user_id: null,
          player_id: null,
          discriminator: null
        }
      },
      characters: { Melee: [], "Project+": [] },
    };
    if (this.#curProfile.profileType == "player") {
      preset.integrations.startgg.player_id = this.#startGG.value !== '' ? this.#startGG.value : null
      preset.integrations.startgg.user_id = this.#startGGUser.value !== '' ? this.#startGGUser.value : null
      preset.integrations.startgg.discriminator = this.#startGGDiscriminator.value !== '' ? this.#startGGDiscriminator.value : null
      preset.integrations.aussmash = this.#aussmash.value !== '' ? this.#aussmash.value : null
      preset.characters[game] = [
        {
          character: this.#curProfile.char,
          skin: this.#curProfile.skin.name,
        },
      ];
      if (this.#curProfile.customImg) {
        preset.characters[game][0].hex = this.#curProfile.skin.hex;
        preset.characters[game][0].customImg = true;
      }

      // if a player preset for this player exists, add already existing characters
      const existingPreset = await getJson(`${stPath.text}/Player Info/${this.#nameInp.value}`);
      if (existingPreset) {
        // Make sure we save presets for both games
        let games = ["Melee", "Project+"];
        games.forEach((x) => {
          // add existing characters to the new json, but not if the character is the same
          for (let i = 0; i < existingPreset.characters[x].length; i++) {
            if (existingPreset.characters[x][i].character != this.#curProfile.char) {
              preset.characters[x].push(existingPreset.characters[x][i]);
            }
          }
        });
      }
    }

    if (this.#curProfile.profileType == "player") {
      saveJson(`/Player Info/${this.#nameInp.value}`, preset);
      displayNotif("Player preset has been saved");
      playerFinder.setPlayerPresets();
    } else {
      saveJson(`/Commentator Info/${this.#nameInp.value}`, preset);
      displayNotif("Commentator preset has been saved");
      commFinder.setCasterPresets();
    }
  }

  fetchStartGGInformation(playerId){
    getPlayerInformation(playerId).then((res) => handle(res, (d)=> {
      this.setTag(d.data.player.prefix);
      let pronouns = d.data.player.user.genderPronoun;
      if(pronouns !== null){
        this.setPronouns(pronouns);
      }
      this.#startGGUser.value = d.data.player.user.id;
      this.#startGGDiscriminator.value = d.data.player.user.discriminator;
    }));
  }


  getPronouns(){return this.#pronounsInp}
  getTag(){return this.#tagInp}
  getName(){return this.#nameInp}
  getState(){return this.#flagSelect}
  getTwitch(){return this.#twitchInp}
  getYt(){return this.#ytInp}
  getTwitter(){return this.#twitterInp}
  getStartGG(){return this.#startGG}
  setPronouns(x){this.#pronounsInp.value = x;}
  setTag(x){this.#tagInp.value = x;}
  setName(x){this.#nameInp.value = x;}
  setState(x){this.#flagSelect.value = x;}
  setTwitch(x){this.#twitchInp.value = x;}
  setYt(x){this.#ytInp.value = x;}
  setTwitter(x){this.#twitterInp.value = x;}
  setStartGG(x){this.#startGG.value = x; this.fetchStartGGInformation(x) }
}

export const profileInfo = new ProfileInfo();

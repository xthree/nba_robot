let jsdom = require("jsdom");
let $ = require("jquery")(new jsdom.JSDOM().window);

const moment = require("moment");
const rp = require("request-promise");
const fs = require("fs");

import { BasketballGameScraper } from "../basketballGameScraper";
import { ESPN } from "./ESPN";
import { GameFile } from "../interfaces/gameFile";

export class Helpers {
  public static getFileLocationByOS(): string {
    switch (process.platform) {
      case "win32":
        return "/output/";
        break;
      case "linux":
        return "/home/pi/output/";
        break;
    }
  }

  public static makeFile(pObject: any, pFileName: string, pFileLocation?: string) {
// TODO CHECK FOR ILLEGAL CHARACTERS : messed it up from placing gametime in filename
    let objectString = JSON.stringify(pObject);

    let fileLocation = pFileLocation ? pFileLocation : this.getFileLocationByOS();
    let fullPath = `${fileLocation}${pFileName}.json`;

    console.log("Making file " + fullPath);

    fs.writeFile(fullPath, objectString, (e) => {
      if (e) console.log(e);
    });
  }

  public static getPageWrapperAsync(pURL: string): JQueryPromise<JQuery> {
    return rp(pURL).then((html: string) => {
      return $(html);
    });
  }

  public static getPageHTMLAsync(pURL: string): string {
    return rp(pURL).then((html: string) => {
      return html;
    });
  }
}

// function getGameInfoForGameIdAsync(pGameId):JQueryPromise< {
//   let game = new BasketballGame(pGameId, fs);
//   return game.run();
// }

//Check JSON files for accuracy

// Read from this folder
// let folderPath = '/outputbackup/json'

// fs.readdirSync(folderPath).forEach((file,x, y) => {
//     console.log(x, y)
//         let filePath = folderPath + '/' + file;
//         console.log(file)
//         fs.readFile(filePath, 'utf8', (err, data) => {
//             //console.log(data)
//             //console.log(err)

//             let gameObject = JSON.parse(data);
//             //console.log(gameObject)
//             compareScores(gameObject, filePath);
//         });
// });

function compareScores(pGameObject: GameFile, pFileName): void {
  let combined = pGameObject.HomeScore + pGameObject.AwayScore;
  let runningScore = 0;

  for (let player of pGameObject.HomePlayers) {
    runningScore += player.points ? player.points : 0;
  }

  for (let player of pGameObject.AwayPlayers) {
    runningScore += player.points ? player.points : 0;
  }

  let scoresMatch = combined == runningScore;

  if (scoresMatch) {
    console.log("scores match");
    //  matchCount++;
  } else {
    console.log("scores do NOT match");
    console.log(pFileName);
    //notMatchCount++;
  }
}

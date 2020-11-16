let jsdom = require("jsdom");
let $ = require("jquery")(new jsdom.JSDOM().window);


const moment = require("moment");
const rp = require("request-promise");
const fs = require("fs");

import { BasketballGame } from "../basketballGame";
import { ESPN } from "./ESPN";

export class Helpers {
  public static makeFile(pObject, pFileName: string, pFileLocation?: string) {
    let objectString = JSON.stringify(pObject);
    let fileLocation = pFileLocation ? pFileLocation : "/output/";
    fs.writeFile(`${fileLocation}${pFileName}`, objectString, (e) => {});
  }
}


function getGameInfoForGameId(pGameId) {
    let game = new BasketballGame(pGameId, fs);
    return game.run();
  }
  


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

// interface GameFile {
//     GameURL: string;
//     GameId: string;
//     Competitors: string;
//     GameDescription: string;
//     AiringNetwork: string;
//     AwayScore: number;
//     HomeScore: number;
//     AwayPlayers: Player[];
//     HomePlayers: Player[];
// }

// function compareScores(pGameObject: GameFile, pFileName) {
//     let combined = pGameObject.HomeScore + pGameObject.AwayScore;
//     let runningScore = 0;

//     for (let player of pGameObject.HomePlayers) {
//         runningScore += player.points ? player.points : 0;
//     }

//     for (let player of pGameObject.AwayPlayers) {
//         runningScore += player.points ? player.points : 0;
//     }

//     let scoresMatch = combined == runningScore;

//     if (scoresMatch) {
//         console.log("scores match")
//       //  matchCount++;
//     }
//     else {
//         console.log("scores do NOT match")
//         console.log(pFileName)
//         //notMatchCount++;
//     }
// }

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

//Global variables for between date call
let gameIds: string[] = [];
let runningDate;
let endDate;
let log = "";
const JSONFILENAME = "EDIT_THIS.json";

// MOMENT DATE FORMAT YYYYMMDD

//getGameIdsBetweenDates(moment('20191022'), moment('20201011'));

function getGameIdsBetweenDates(pStartMoment, pEndMoment) {
  runningDate = pStartMoment;
  endDate = pEndMoment;

  let firstWeekURL = ESPN.schedule + runningDate.format("YYYYMMDD");

  getWeeksGameIds(firstWeekURL).then((e) => {
    console.log("done done");
    console.log(e);
  });
}

// Recursive
function getWeeksGameIds(pURL): Promise<any> {
  return rp(pURL)
    .then((html) => {
      console.log("fetched page");
      $(html);
      let links = $(html)
        .find("#sched-container .responsive-table-wrap table tbody tr")
        .find("td.home")
        .next()
        .find("a")
        .toArray();

      for (let link of links) {
        var href = $(link).attr("href");
        // strip the game ids from the href url
        gameIds.push(href.substring(href.lastIndexOf("=") + 1));
      }
      return;
    })
    .then(() => {
      runningDate.add(7, "days");
      log += `Running date: ${runningDate.toString()}`;
      log += `End Date: ${endDate.toString()}`;

      // If we
      if (runningDate < endDate) {
        console.log("Running again");
        log += `Running Again\n`;

        let scheduleWeekURL = ESPN.schedule + runningDate.format("YYYYMMDD");
        return getWeeksGameIds(scheduleWeekURL);
      } else {
        log += "done\n";

        Helpers.makeFile(gameIds, JSONFILENAME);
        Helpers.makeFile(log, "Idog.txt");
      }

      return "DONE DONE MFERS";
    });
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

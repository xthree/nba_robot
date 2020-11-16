import { BasketballGame } from "./basketballGame"
import { Player } from "./player"

const moment = require('moment')

let jsdom = require("jsdom");
let $ = require('jquery')(new jsdom.JSDOM().window);

const rp = require('request-promise');
const fs = require('fs');






// Scheduler
// function scheduleGame(pStartTime, pGameId) {
//   scheduler.scheduleJob(pStartTime, function (y) {
//     new BasketballGame(pGameId, fs);
//   });
// }

// const scheduler = require('node-schedule');
// rp("http://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard").then((e) => {
//   var data = JSON.parse(e);
//   for (let event of data.events) {
//     let gameStartTime = new Date(event.date);
//     gameStartTime.setMinutes(gameStartTime.getMinutes() - 15);

//     console.log(`${event.name} scheduled for ${gameStartTime}. ${event.id}`);
//     scheduleGame(gameStartTime, event.id);
//   }
// });












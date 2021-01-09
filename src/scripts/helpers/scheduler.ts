const scheduler = require("node-schedule");
const rp = require("request-promise");

import { BasketballGame } from "../basketballGame";
import { ESPN } from "./ESPN";

export class Scheduler {
  //Scheduler
  public static scheduleGame(pStartTime, pGameId) {
    scheduler.scheduleJob(pStartTime, function (y) {
      let game = new BasketballGame(pGameId);
      game.run();
    });
  }

  public static scheduleNow() {
    console.log("scheduling");
    scheduler.scheduleJob(new Date(), () => {
      console.log("JOB RUNNING");
    });
  }

  public static scheduleAllGames() {
    // Fetches all the games for the day and schedules a task to monitor the game
    rp(ESPN.hiddenAPI).then((e) => {
      var data = JSON.parse(e);
      console.log(data);
      for (let event of data.events) {
        let gameStartTime = new Date(event.date);
        let fifteenMinsBeforeGameStartTime = new Date(event.date);
        fifteenMinsBeforeGameStartTime.setMinutes(fifteenMinsBeforeGameStartTime.getMinutes() - 15);

        if (gameStartTime < new Date() || fifteenMinsBeforeGameStartTime <= new Date()) {
          setTimeout(() => {
              console.log("Game already started, running immediately")
            var game = new BasketballGame(event.id);
            game.run();
          }, 52);
        }

        gameStartTime.setMinutes(gameStartTime.getMinutes() - 15);

        console.log(
          `${event.name} scheduled for ${gameStartTime}. ${event.id}`
        );

        this.scheduleGame(gameStartTime, event.id);
      }
    });
  }
}

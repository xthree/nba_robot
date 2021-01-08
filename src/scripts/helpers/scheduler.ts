const scheduler = require("node-schedule");
const rp = require("request-promise");

import { BasketballGame } from "../basketballGame";

export class Scheduler {
  //Scheduler
  public static scheduleGame(pStartTime, pGameId) {
    scheduler.scheduleJob(pStartTime, function (y) {
      let game = new BasketballGame(pGameId);
      game.run();
    });
  }

  public static scheduleAllGames() {
    // Fetches all the games for the day and schedules a task to monitor the game
    rp().then((e) => {
      var data = JSON.parse(e);
      for (let event of data.events) {
        let gameStartTime = new Date(event.date);
        gameStartTime.setMinutes(gameStartTime.getMinutes() - 15);

        console.log(
          `${event.name} scheduled for ${gameStartTime}. ${event.id}`
        );

        this.scheduleGame(gameStartTime, event.id);
      }
    });
  }
}

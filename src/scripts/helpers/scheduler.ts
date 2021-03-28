const scheduler = require("node-schedule");
const rp = require("request-promise");

import { BasketballGameScraper } from "../basketballGameScraper";
import { APIReturn } from "../basketballGame";
import { BasketballGame } from "../basketballGame";

import { ESPN } from "./ESPN";

export class Scheduler {
  public static lastDate: string;

  //Scheduler
  public static scheduleThis(pFunction: Function, pScheduleDateTime: Date): void {
    scheduler.scheduleJob(pScheduleDateTime, (y) => {
      if (typeof pFunction == "function") {
        pFunction(y);
      }
    });
  }

  public static addMinutesToNow(pMinutesToAdd: number) {
    let date = new Date();
    date.setMinutes(date.getMinutes() + pMinutesToAdd);
    return date;
  }

  // Recursive-ish via scheduled recalls.  This runs the bot infinitely.
  public static async dateRolloverCheck(pIsDebug: boolean, pSkipToday: boolean = false) {
    let currentAPIDate = await ESPN.getAPIDate();

    // Schedule all the games for the day and then reschedule tomorrow's api date check

    // Date format is YYYY-MM-DD which resolves to Zulu 2021-01-18 00:00. Must be converted into an American timezone by adding timezone offset hours.
    if (this.lastDate != currentAPIDate) {

      // Skip scheduling today's game and set up for tomorrow instead (we have already tweeted out today's games is the usual reason)
      if (pSkipToday) {
        this.lastDate = currentAPIDate;
        let tomorrowDateTime = new Date(currentAPIDate);

        // Turn GMT time add 5 hours for EST at Midnight, then add 2 for 2AM

        // GMT time: 0700
        //  GMT-0500 EST 02:00 AM   
        //  GMT-0400 EDT 03:00 AM
        tomorrowDateTime.setHours(tomorrowDateTime.getHours() + 5 + 2 + 24);
        let nowDate = new Date();
        let refreshDate;

        if (tomorrowDateTime < nowDate) {
          refreshDate = nowDate.setMinutes(nowDate.getMinutes() + 5);
        }
        else {
          refreshDate = tomorrowDateTime;
        }

        Scheduler.scheduleThis(() => Scheduler.dateRolloverCheck(pIsDebug), refreshDate);
        console.log(
          "Skipping today's games. See you tomorrow at " + refreshDate.toLocaleString() + " for a date rollover check"
        );

        return;
      }

      this.scheduleAllAPIGames(pIsDebug).then(() => {
        this.lastDate = currentAPIDate;
        let nextScheduleDate = new Date(currentAPIDate);

        // Turn GMT time add 5 hours for EST at Midnight, then add 2 for 2AM

        // GMT time: 0700
        //  GMT-0500 EST 02:00 AM   
        //  GMT-0400 EDT 03:00 AM
        nextScheduleDate.setHours(nextScheduleDate.getHours() + 5 + 2 + 24);

        Scheduler.scheduleThis(() => Scheduler.dateRolloverCheck(pIsDebug), nextScheduleDate);
        console.log("Games scheduled. See you again at " + nextScheduleDate.toLocaleString() + " for a date rollover check"
        );
      });
    } else {
      // After 3am, check every 30mins
      let date = new Date();
      date.setMinutes(date.getMinutes() + 30);
      Scheduler.scheduleThis(() => Scheduler.dateRolloverCheck(pIsDebug), date);

      console.log("Next 30 minute date rollover check at " + date.toLocaleString());
    }
  }

  public static scheduleScraperGame(pStartTime, pGameId): void {
    scheduler.scheduleJob(pStartTime, (y) => {
      let game = new BasketballGameScraper(pGameId);
      game.init().then((e) => {
        game.run();
      });
    });
  }

  public static scheduleAllScraperGames(): void {
    // Fetches all the games for the day and schedules a task to monitor the game
    rp(ESPN.hiddenAPI).then((e) => {
      var data: APIReturn = JSON.parse(e);
      console.log(data);
      for (let event of data.events) {
        let gameStartTime = new Date(event.date);
        let fifteenMinsBeforeGameStartTime = new Date(event.date);
        fifteenMinsBeforeGameStartTime.setMinutes(fifteenMinsBeforeGameStartTime.getMinutes() - 15);

        if (gameStartTime < new Date() || fifteenMinsBeforeGameStartTime <= new Date()) {
          setTimeout(() => {
            console.log("Game already started, running immediately");
            var game = new BasketballGameScraper(event.id);
            game.init().then((e) => {
              console.log(e);
              game.run();
            });
          }, 52);
        }

        gameStartTime.setMinutes(gameStartTime.getMinutes() - 15);

        console.log(`${event.name} scheduled for ${gameStartTime}. ${event.id}`);

        this.scheduleScraperGame(gameStartTime, event.id);
      }
    });
  }

  public static scheduleAPIGame(pStartTime, pGameId, pIsDebug: boolean): void {
    scheduler.scheduleJob(pStartTime, (y) => {
      var game = new BasketballGame(pGameId, pIsDebug);
      game.initGame().then(() => game.run());
    });
  }

  public static scheduleAllAPIGames(pIsDebug: boolean): JQueryPromise<any> {
    return rp(ESPN.hiddenAPI).then((e) => {
      var data: APIReturn = JSON.parse(e);

      for (let event of data.events) {
        // Start 15 minutes before game starts
        let gameStartTime = new Date(event.date);
        gameStartTime.setMinutes(gameStartTime.getMinutes() - 15);

        if (gameStartTime < new Date()) {
          console.log("Game already started, running immediately");
          let game = new BasketballGame(event.id, pIsDebug);
          game.initGame().then((e) => {
            game.run();
          });

          continue;
        } else {
          console.log(`${event.name} scheduled for ${gameStartTime} ${event.id}`);
          Scheduler.scheduleAPIGame(gameStartTime, event.id, pIsDebug);
        }
      }
      return;
    });
  }
}

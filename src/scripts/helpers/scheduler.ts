const scheduler = require("node-schedule");
const rp = require("request-promise");

import { BasketballGameScraper } from "../basketballGameScraper";
import { APIReturn } from "../basketballGame";
import { BasketballGame } from "../basketballGame";

import { ESPN } from "./ESPN";
import { addHoursToTime, addMinutesToTime, isDateInThePast, setDateRolloverDateTime } from "../utils/dateHelper";

export class Scheduler {
  public static lastDate: string;
  public static currentAPIDate: string;

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

  public static getNextAPIRefreshDate() {
    return setDateRolloverDateTime(addHoursToTime(new Date(this.currentAPIDate), 24));
  }

  public static scheduleTomorrowsRollover() {
    this.scheduleRolloverCheck(this.getNextAPIRefreshDate());
    console.log("See you tomorrow");
    this.lastDate = this.currentAPIDate;
  }

  public static scheduleRolloverCheck(date: Date) {
    Scheduler.scheduleThis(() => Scheduler.dateRolloverCheck(), date);
    console.log("Next date rollover check at: " + date.toLocaleString());
  }

  public static firstRunSkipTodayScheduling() {
    console.log("Skipping today's games");

    // In the case we are skipping the actual day, but the api hasn't updated the date yet, check again every 5 minutes.

    // Use case: the current real time is Jan 2 at 6am, but the API's date has not updated and is still at Jan 1.
    // The next refresh date using the API date is Jan 2 at 3am. Since it is 6am, this date is in the past and we can't schedule in the past.
    // Instead check every 5 minutes until the API updates. When it does eventually rollover,
    if (isDateInThePast(this.getNextAPIRefreshDate())) {
      this.scheduleRolloverCheck(addMinutesToTime(new Date(), 5));
      return;
    }

    // If the next refresh date is in the future, go ahead and schedule it
    this.scheduleTomorrowsRollover();
  }

  // Recursive-ish via scheduled recalls.  This runs the bot indefinitely when first called from app.ts
  public static async dateRolloverCheck(pSkipToday: boolean = false) {
    const fetchedAPIDate = await ESPN.getAPIDate(); // Date format is YYYY-MM-DD which resolves to Zulu 2021-01-18 00:00. Must be converted into an American timezone by adding timezone offset hours.

    // If it's the same date, check again in 30 minutes
    if (this.lastDate === fetchedAPIDate) {
      this.scheduleRolloverCheck(addMinutesToTime(new Date(), 30));
      console.log("Checking again in 30 minutes");
      return;
    }

    this.currentAPIDate = fetchedAPIDate;
    // Skip scheduling today's game and set up for tomorrow instead (we have already tweeted out today's games is the usual reason)
    if (pSkipToday) {
      this.firstRunSkipTodayScheduling();
      return;
    }

    // Schedule all the games for the day and then reschedule tomorrow's api date check
    this.scheduleAllAPIGames().then(() => {
      console.log("Games scheduled for " + new Date(this.lastDate).toLocaleDateString());
      this.scheduleTomorrowsRollover();
    });

    return;
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

  public static scheduleAPIGame(pStartTime, pGameId): void {
    scheduler.scheduleJob(pStartTime, (y) => {
      var game = new BasketballGame(pGameId);
      game.initGame().then(() => game.run());
    });
  }

  public static scheduleAllAPIGames(): JQueryPromise<any> {
    return rp(ESPN.hiddenAPI).then((e) => {
      var data: APIReturn = JSON.parse(e);

      for (let event of data.events) {
        // Start 15 minutes before game starts
        let gameStartTime = new Date(event.date);
        gameStartTime.setMinutes(gameStartTime.getMinutes() - 15);

        if (gameStartTime < new Date()) {
          console.log("Game already started, running immediately");
          let game = new BasketballGame(event.id);
          game.initGame().then((e) => {
            game.run();
          });

          continue;
        } else {
          console.log(`${event.name} scheduled for ${gameStartTime} ${event.id}`);
          Scheduler.scheduleAPIGame(gameStartTime, event.id);
        }
      }
      return;
    });
  }
}

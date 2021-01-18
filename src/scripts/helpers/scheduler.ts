const scheduler = require("node-schedule");
const rp = require("request-promise");

import { BasketballGameScraper } from "../basketballGameScraper";
import { APIReturn } from "../basketballGame";
import { BasketballGame } from "../basketballGame";

import { ESPN } from "./ESPN";

export class Scheduler {
  public static lastGameDate: string;
  public static gamesToday:boolean;

  //Scheduler
  public static scheduleThis(pFunction: Function, pDateTime: Date): void {
    scheduler.scheduleJob(pDateTime, (y) => {
      if (typeof pFunction == "function") {
        pFunction(y);
      }
    });
  }

  public static scheduleScraperGame(pStartTime, pGameId): void {
    scheduler.scheduleJob(pStartTime, (y) => {
      let game = new BasketballGameScraper(pGameId);
      game.init().then((e)=> { game.run()});
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
        fifteenMinsBeforeGameStartTime.setMinutes(
          fifteenMinsBeforeGameStartTime.getMinutes() - 15
        );

        if (gameStartTime < new Date() ||fifteenMinsBeforeGameStartTime <= new Date()) {
          setTimeout(() => {
            console.log("Game already started, running immediately");
            var game = new BasketballGameScraper(event.id);
            game.init().then((e)=> { console.log(e); game.run()});
          }, 52);
        }

        gameStartTime.setMinutes(gameStartTime.getMinutes() - 15);

        console.log(
          `${event.name} scheduled for ${gameStartTime}. ${event.id}`
        );

        this.scheduleScraperGame(gameStartTime, event.id);
      }
    });
  }


  public static scheduleAPIGame(pStartTime, pGameId, pIsDebug:boolean): void {
    scheduler.scheduleJob(pStartTime, (y) => {
    var game = new BasketballGame(pGameId,pIsDebug);
        game.initGame().then(() => game.run());});
  }

  public static scheduleAllAPIGames(pIsDebug:boolean):void {
    rp(ESPN.hiddenAPI).then((e) => {
      var data: APIReturn = JSON.parse(e);

      for (let event of data.events) {
        let gameStartTime = new Date(event.date);
        gameStartTime.setMinutes(gameStartTime.getMinutes() - 15);

        if (gameStartTime < new Date()) {
            console.log("Game already started, running immediately");
            let game = new BasketballGame(event.id, pIsDebug);
            game.initGame().then((e)=> {  game.run();  });

            continue;

        } else {
          console.log(
            `${event.name} scheduled for ${gameStartTime} ${event.id}` 
          );               
          Scheduler.scheduleAPIGame(gameStartTime, event.id, pIsDebug);
        }
      }
    });
  }

  // public static checkDateUpdate():void {
  //   rp(ESPN.hiddenAPI).then((e) => {  
  //     var data: APIReturn = JSON.parse(e);
  //     let date = data.day.date;

  //     if(new Date(this.lastGameDate).getDay() < new Date(date).getDay()) {

  //       if(data.events.length == 0) {
  //         console.log("no games today")
  //       }
  //       this.lastGameDate = date;
  //       this.scheduleAllAPIGames();
  //       this.haveFetchedGamesToday = true;
        
  //       this.scheduleThis(()=> { this.checkDateUpdate(); }, new Date())
  //     } 
  //   });
  // }

  // public static determineNextGameFetch(){
  //       if(this.haveFetchedGamesToday) {
  //           //schedule for tomorrow at 5am EST
  //       }
  //       else {
  //           // try again in 30 mins
  //       }
  // }
}


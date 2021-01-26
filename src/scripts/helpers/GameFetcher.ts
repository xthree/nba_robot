import { BasketballGameScraper } from "../basketballGameScraper";
import { Helpers } from "./helpers";
const fs = require("fs");

export class GameFetcher {
  private index = 0;
  private gameIdList: string[];
  private inaccurateGameScore: string[] = [];

  constructor(pListOfGameIds: string[]) {
    this.gameIdList = pListOfGameIds;
  }

  public run() {
    console.log("GameFetcher Activated");
    let firstGameId = this.gameIdList[0];
    this.createNextGame(firstGameId);
  }

  private createNextGame(pGameId) {
    this.index == 0 ? console.log("first game") : console.log("next game");

    let game = new BasketballGameScraper(pGameId);

    return game.init().then(() => game.run()).then(() => {

      this.index++;
      let nextGameId = this.gameIdList[this.index];

      // If we still have more gameIds left
      if (nextGameId) {
        return this.createNextGame(nextGameId);
      } else {
        console.log("That was the last game");
      }
    });
  }
}

console.log("suh");
try {
  let gamerIDListFilePath = "/output/seasonIds.json";
  let gameIDArrayString = fs.readFileSync(gamerIDListFilePath, "utf8");
  console.log(gameIDArrayString);
  let gameIDArray = JSON.parse(gameIDArrayString);
  console.log(gameIDArray);

  let gameFetcher = new GameFetcher(gameIDArray);
  gameFetcher.run();
} catch (error) {
  console.log(error);
}

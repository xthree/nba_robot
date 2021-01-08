const rp = require("request-promise");
const fs = require("fs");

import { Twitter } from "./twitter";
import { Team } from "./team";
import { ESPN } from "./helpers/ESPN";
import { Helpers } from "./helpers/helpers";

let jsdom = require("jsdom");
let $ = require("jquery")(new jsdom.JSDOM().window);

export class BasketballGame {
  private twitterBot: Twitter;

  private $pageWrapper: JQuery;
  private $wrapper: JQuery;
  public $headerWrapper: JQuery;

  private description: string;
  public airingNetwork: string;

  private hasGameStarted = false;
  private isConcluded: boolean = false;
  private gameConcludedInOvertime: boolean = false;

  private gameId;
  private URL: string;

  private currentQuarter: number;
  public currentTime: string;
  private lastTime: string; // Last game clock time
  private lastCombinedScore: number; // Last combined score total
  private hasScoreAndTimeChanged: boolean;

  private isEndOfQuarter: boolean;
  private haveDisplayedEndOfQuarter: boolean = false;
  private haveDisplayedStartOfGame: boolean = false;
  private haveDisplayedEndOfGame: boolean = false;

  private homeTeam: Team;
  private awayTeam: Team;

  private outputLog: string = "";

  constructor(gameId: string) {
    this.gameId = gameId;
    this.URL = ESPN.boxScore + gameId;
    this.twitterBot = new Twitter(false); // CHANGE THIS TO FALSE TO ENABLE TWEETING

    this.fetchPageHTMLAsync().then((html) => {
      this.setUpContainers(html);
      this.initializeTeams();
    });
  }

  //returns true if sucessful save
  private generateSaveFile(): object {
    console.log("Generating Save File");

    var gameFile = {
      GameId: this.gameId,
      GameURL: this.URL,
      Competitors: this.awayTeam.name + "-" + this.homeTeam.name,
      GameDescription: this.description,
      AiringNetwork: this.airingNetwork,
      AwayScore: this.getAwayTeamScore(),
      HomeScore: this.getHomeTeamScore(),
      AwayPlayers: this.awayTeam.players,
      HomePlayers: this.homeTeam.players,
      IsAccurate:
        this.awayTeam.areScoresAccurate && this.homeTeam.areScoresAccurate,
    };
    console.log("Game was");
    let gameJson = JSON.stringify(gameFile);

    if (gameFile.IsAccurate) {
      console.log("Score was accurate");
    } else {
      console.log("ERROR Inaccurate score");
    }

    // THIS IS USING NOW'S DATE. NOT GOOD. NEED GAME DATE
    const date = new Date();
    const dateTimeFormat = new Intl.DateTimeFormat("en", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
    const [
      { value: month },
      ,
      { value: day },
      ,
      { value: year },
    ] = dateTimeFormat.formatToParts(date);

    var dateText = `${day}-${month}-${year}`;

    var fileName = `${this.gameId}_${gameFile.Competitors}_${dateText}`;

    Helpers.makeFile(gameFile, fileName);

    fs.writeFile(`/home/pi/output/${fileName}.json`, gameJson, (e) => {
      console.log(e);

      console.log("Sucessfully Saved");
    });

    return gameFile;
  }

  public refreshData(): JQueryPromise<any> {
    console.log("Refreshing Data");

    return this.fetchPageHTMLAsync().then((html) => {
      this.setUpContainers(html);
      this.setUpTeamContainers();
      this.updateGameData();

      this.liveTweet();
    });
  }

  // Returns a promsise that resolves when the game is finished and game files have been successfully saved
  public run(): JQueryPromise<any> {
    //@ts-ignore
    return new Promise((resolve, reject) => {
      console.log("running");
      let updateInterval = 5000;

      var intervalId = setInterval(
        () => {
          this.refreshData().then(() => {
            if (this.isConcluded) {
              var game = this.generateSaveFile();

              clearInterval(intervalId);
              resolve(true);
            }
          });
        },
        updateInterval
      );
    });
  }

  public fetchPageHTMLAsync(): JQueryPromise<string> {
    return rp(this.URL);
  }

  public liveTweet() {
    // First run through, always announce start of game.
    if (this.hasGameStarted && !this.haveDisplayedStartOfGame) {
      this.twitterBot.sendTweet(
        `${this.awayTeam.name} ${this.homeTeam.name}\nGame has started`
      );

      this.haveDisplayedStartOfGame = true;
      return;
    }

    // First run through, always announce end of game.
    if (this.isConcluded && !this.haveDisplayedEndOfGame) {
      let msg = `\n${this.currentTime}\n${this.awayTeam.name}-${this.awayTeam.score} ${this.homeTeam.name}-${this.homeTeam.score}`;

      this.twitterBot.sendTweet(msg);
      this.haveDisplayedEndOfGame = true;
      return;
    }

    // Block display
    if (
      (this.isEndOfQuarter && !this.haveDisplayedEndOfQuarter) ||
      (!this.hasGameStarted && !this.haveDisplayedEndOfQuarter)
    ) {
      if (!this.hasGameStarted) {
        let msg = "Game has not yet started";
        this.outputLog += msg;
        console.log(msg);
        this.haveDisplayedEndOfQuarter = true;

        return;
      }

      let msg = `\n${this.currentTime}\n${this.awayTeam.name}-${this.awayTeam.score} ${this.homeTeam.name}-${this.homeTeam.score}`;
      this.outputLog += msg;

      this.twitterBot.sendTweet(msg);
      this.haveDisplayedEndOfQuarter = true;
      return;
    } else if (
      (this.isEndOfQuarter && this.haveDisplayedEndOfQuarter) ||
      (!this.hasGameStarted && this.haveDisplayedEndOfQuarter)
    ) {
      return; //Wait until game starts again
    }
  }

  private updateLog() {
    if (this.hasScoreAndTimeChanged || this.isConcluded) {
      let msg = `\n${this.currentTime}  ${this.awayTeam.name}-${this.awayTeam.score} ${this.homeTeam.name}-${this.homeTeam.score}`;
      console.log(msg);

      this.outputLog += msg;
    }
  }

  public updateGameData(): void {
    this.description = this.$headerWrapper.find(".game-details").text().trim();
    this.airingNetwork = this.$headerWrapper
      .find(".game-status .network")
      .text()
      .trim();

    this.hasGameStarted =
      this.$wrapper.text().trim() != "No Box Score Available";
    this.currentTime = this.$headerWrapper
      .find(".game-status .game-time")
      .text()
      .trim();

    this.isEndOfQuarter =
      this.currentTime.includes("End") || this.currentTime.includes("Half");
    this.isConcluded = this.currentTime.includes("Final");

    let homeTeamScore = this.getHomeTeamScore();
    let awayTeamScore = this.getAwayTeamScore();
    let combinedScore = homeTeamScore + awayTeamScore;

    this.hasScoreAndTimeChanged =
      this.lastTime != this.currentTime &&
      combinedScore != this.lastCombinedScore;

    this.haveDisplayedEndOfQuarter =
      this.hasScoreAndTimeChanged || this.isConcluded
        ? false
        : this.haveDisplayedEndOfQuarter;

    this.homeTeam.updateTeamData(homeTeamScore, this.isConcluded);
    this.awayTeam.updateTeamData(awayTeamScore, this.isConcluded);

    this.lastTime = this.currentTime;
    this.lastCombinedScore = combinedScore;
  }

  public setUpContainers(pHtml: string): void {
    this.$pageWrapper = $(pHtml);
    this.$wrapper = this.$pageWrapper.find("#gamepackage-box-score");
    this.$headerWrapper = this.$pageWrapper.find("#gamepackage-matchup-wrap");
  }

  public setUpTeamContainers(): void {
    this.homeTeam.updateContainer(this.$wrapper.find(".gamepackage-home-wrap"));
    this.awayTeam.updateContainer(this.$wrapper.find(".gamepackage-away-wrap"));
  }

  public initializeTeams() {
    // Home
    let $homeWrapper = this.$wrapper.find(".gamepackage-home-wrap");
    let $homeHeaderWrapper = this.$headerWrapper.find(".team.home");

    let homeTeamUID = $homeHeaderWrapper
      .find(".team-name")
      .data("clubhouse-uid");
    let homeTeamLocation = $homeHeaderWrapper.find(".long-name").text().trim();
    let homeTeamName = $homeHeaderWrapper
      .find(".team-name .short-name")
      .text()
      .trim();
    let homeTeamNameAbbreviation = $homeHeaderWrapper
      .find(".team-name .abbrev")
      .text()
      .trim();

    this.homeTeam = new Team(
      $homeWrapper,
      homeTeamUID,
      homeTeamLocation,
      homeTeamName,
      homeTeamNameAbbreviation,
      true
    );

    // Away
    let $awayWrapper = this.$wrapper.find(".gamepackage-away-wrap");
    let $awayHeaderWrapper = this.$headerWrapper.find(".team.away");

    let awayTeamUID = $awayHeaderWrapper
      .find(".team-name")
      .data("clubhouse-uid");
    let awayTeamLocation = $awayHeaderWrapper
      .find(".team-name .long-name")
      .text()
      .trim();
    let awayTeamName = $awayHeaderWrapper
      .find(".team-name .short-name")
      .text()
      .trim();
    let awayTeamNameAbbreviation = $awayHeaderWrapper
      .find(".team-name .abbrev")
      .text()
      .trim();

    this.awayTeam = new Team(
      $awayWrapper,
      awayTeamUID,
      awayTeamLocation,
      awayTeamName,
      awayTeamNameAbbreviation,
      false
    );
  }

  public getHomeTeamScore(): number {
    return parseInt(
      this.$headerWrapper.find(".team.home .score").text().trim()
    );
  }

  public getAwayTeamScore(): number {
    return parseInt(
      this.$headerWrapper.find(".team.away .score").text().trim()
    );
  }
}

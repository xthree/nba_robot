const rp = require("request-promise");

import { Twitter } from "./twitter";
import { NBA } from "./helpers/NBA";
import { ESPN } from "./helpers/ESPN";
import { Helpers } from "./helpers/helpers";
import { Scheduler } from "./helpers/scheduler";
import { BasketballGameScraper } from "./basketballGameScraper";

export enum GameEventType {
  Started = 0,
  EndOfPeriod = 1, //End of first Quarter
  Final = 2,
}

export class GameEvent {
  public type: GameEventType;
  public period: number;

  public delayed: boolean;
  public finished: boolean;

  public gameText: string; //Used to detect if score changed after EOP 60 second delay
  private isDebug: boolean;

  constructor(pType: GameEventType, pPeriod?: number) {
    this.type = pType;
    this.period = pPeriod ? pPeriod : 0;
    this.finished = false;
    this.delayed = false;
    this.isDebug = process.env.isDebug === "true";
  }
}

export class BasketballGame {
  private refreshCount = 0;
  public gameId: string;
  public gameStartDateTime: string; // eg 2021-01-11T01:00Z
  private TwitterBot: Twitter;
  private lastTweetId: string = null;

  public Event: event;
  public TweetEvents: GameEvent[] = [];

  public isDebug: boolean;

  public clockSeconds: number; // Seconds left in period
  public period: number;
  public statusDetail: string;

  public venueId: string;
  public isPostponed: boolean;
  public isStarted: boolean;
  public isEndOfPeriod: boolean;
  public isHalftime: boolean;
  public isCompleted: boolean;

  public awayTeamId: string;
  public awayTeamName: string;
  public awayTeamScore: number;

  public homeTeamId: string;
  public homeTeamName: string;
  public homeTeamScore: number;

  public constructor(pGameId: string) {
    this.gameId = pGameId;
    this.isDebug = process.env.isDebug === "true";
    this.TwitterBot = new Twitter(); // CHANGE THIS TO FALSE TO ENABLE TWEETING
  }

  public isTiedGame(): boolean {
    return this.awayTeamScore == this.homeTeamScore;
  }

  public initGame(): Promise<any> {
    this.TweetEvents.push(new GameEvent(GameEventType.Started, 0));
    this.TweetEvents.push(new GameEvent(GameEventType.EndOfPeriod, 1));
    this.TweetEvents.push(new GameEvent(GameEventType.EndOfPeriod, 2));
    this.TweetEvents.push(new GameEvent(GameEventType.EndOfPeriod, 3));
    this.TweetEvents.push(new GameEvent(GameEventType.EndOfPeriod, 4));
    this.TweetEvents.push(new GameEvent(GameEventType.Final, 0));

    return new Promise((resolve, reject) => {
      this.fetchData().then(() => {
        this.awayTeamId = this.Event.competitions[0].competitors.find((e) => e.homeAway == "away").team.id;
        this.awayTeamName = this.Event.competitions[0].competitors.find((e) => e.homeAway == "away").team.name;

        this.homeTeamId = this.Event.competitions[0].competitors.find((e) => e.homeAway == "home").team.id;
        this.homeTeamName = this.Event.competitions[0].competitors.find((e) => e.homeAway == "home").team.name;

        this.gameStartDateTime = this.Event.date;
        this.venueId = this.Event.competitions[0].venue.id;

        resolve(true);
      });
    });
  }

  private fetchData(): JQueryPromise<any> {
    return rp(ESPN.hiddenAPI).then((d: any) => {
      let APIData: APIReturn = JSON.parse(d);
      this.Event = APIData.events.find((e: event) => e.id === this.gameId);
    });
  }

  private displayGameData() {
    console.log(this.Event.competitions[0].status.type.detail); // 15.5 - 4th Quarter, End of 3rd Quarter, End of 4th Quarter, Final, Final/OT, Final/OT2
    console.log(this.Event.status.displayClock); //15.5
    console.log(this.Event.status.type.description); // In Progress, End of Period, Final

    let awayScore = this.Event.competitions[0].competitors.find((e) => e.homeAway === "away")?.score;
    let awayTeamName = this.Event.competitions[0].competitors.find((e) => e.homeAway === "away")?.team.name;

    let homeScore = this.Event.competitions[0].competitors.find((e) => e.homeAway === "home")?.score;
    let homeTeamName = this.Event.competitions[0].competitors.find((e) => e.homeAway === "home")?.team.name;

    console.log(`${awayTeamName}-${awayScore}`);
    console.log(`${homeTeamName}-${homeScore}`);
    console.log();
  }

  private getGameEventByType(pGameEventType: GameEventType, pPeriod: number): GameEvent | null {
    let event = this.TweetEvents.find((e) => {
      return e.type == pGameEventType && e.period == pPeriod;
    });

    return event ? event : null;
  }

  private liveTweet() {
    if (this.isPostponed) {
      this.TwitterBot.sendTweet(`${this.awayTeamName} ${this.homeTeamName}\nGame has been postponed`);
      return;
    }

    if (this.isStarted) {
      let event = this.getGameEventByType(GameEventType.Started, 0);

      if (!event?.finished) {
        let tweetMsg = `${this.awayTeamName} ${this.homeTeamName}\nGame has started`;
        if (!this.isDebug) tweetMsg += `\n${NBA.LeagueWideHashtags.NBATwitter} ${NBA.LeagueWideHashtags.NBA}`;
        this.TwitterBot.sendTweet(tweetMsg)
          .then((tweetId) => {
            this.lastTweetId = tweetId;
          })
          .catch(() => {
            console.log("Catch");
          });
        event.finished = true;
      }
    }

    if (this.isEndOfPeriod || this.isHalftime) {
      let tweetMsg = `${this.statusDetail}\n${this.awayTeamName}-${this.awayTeamScore} ${this.homeTeamName}-${this.homeTeamScore}`;

      tweetMsg += this.getFirstHashtagLine();

      if (!this.isDebug) {
        tweetMsg += this.getNBAHashtagLine();
      }

      // Only tweet End of 4th if going into overtime / tied game
      if (this.period >= 4 && !this.isTiedGame()) {
        return;
      }

      // If we are in the 4th quarter or overtime, and game is tied, add another game event for the next period
      if (this.period >= 4 && this.isTiedGame()) {
        if (!this.getGameEventByType(GameEventType.EndOfPeriod, this.period + 1)) {
          this.TweetEvents.push(new GameEvent(GameEventType.EndOfPeriod, this.period + 1));
        }
      }

      let event = this.getGameEventByType(GameEventType.EndOfPeriod, this.period);

      if (!event.finished) {
        let isGameStatusTextDifferent = event.gameText != this.getGameStatusText();

        if (isGameStatusTextDifferent) {
          console.log();
          console.log("Score was different since first detect of end of period");
          console.log("Was: " + event.gameText);
          console.log("Now: " + this.getGameStatusText());
          console.log();
        }

        this.TwitterBot.sendTweet(tweetMsg, this.lastTweetId)
          .then((tweetId) => {
            this.lastTweetId = tweetId;
          })
          .catch(() => {
            console.log("Catch");
          });
        event.finished = true;
        return;
      }
    }

    if (this.isCompleted) {
      let event = this.getGameEventByType(GameEventType.Final, 0);
      let tweetMsg = `${this.statusDetail}\n${this.awayTeamName}-${this.awayTeamScore} ${this.homeTeamName}-${this.homeTeamScore}`;

      tweetMsg += this.getFirstHashtagLine();

      if (!this.isDebug) {
        tweetMsg += this.getNBAHashtagLine();
      }

      let isGameStatusTextDifferent = event.gameText != this.getGameStatusText();

      if (isGameStatusTextDifferent) {
        console.log();
        console.log("Score was different since first detect of end of period");
        console.log("Was: " + event.gameText);
        console.log("Now: " + this.getGameStatusText());
        console.log();
      }

      this.TwitterBot.sendTweet(tweetMsg, this.lastTweetId)
        .then((tweetId) => {
          this.lastTweetId = tweetId;
        })
        .catch(() => {
          console.log("Catch");
        });

      event.finished = true;
    }

    return true;
  }

  private startDidTeamWinInterval(awayOrHome: "home" | "away") {
    const teamId = awayOrHome === "away" ? this.awayTeamId : this.homeTeamId;

    const didTeamWinHandle = NBA.GetTeamByESPNId(teamId).didTeamWinHandle;

    if (didTeamWinHandle) {
      let interval = setInterval(async () => {
        const latestTweet = await this.TwitterBot.getLatestTweetFromAccount(didTeamWinHandle);
        console.log("Latest tweet", latestTweet);

        const gameStartTimeDate = new Date(this.gameStartDateTime);
        const latestTweetDate = new Date(latestTweet.created_at);
        const isTweetAfterGameStartTime = latestTweetDate > gameStartTimeDate;

        const nowTime = new Date();
        const diffTime = Math.abs(nowTime.getTime() - gameStartTimeDate.getTime());

        // If it's been roughly 2 weeks since the last tweet from the account, assume the account is inactive and don't continue checking
        if (nowTime.getTime() - latestTweetDate.getTime() > 1296000000) {
          clearInterval(interval);
          return;
        }

        // If it's been over 14 hours since game start time and still the account hasn't tweeted, give up
        if (diffTime > 50400000) {
          console.log("Its been too long finding did team win tweet, giving up");
          clearInterval(interval);
          return;
        }

        if (isTweetAfterGameStartTime) {
          clearInterval(interval);

          console.log(latestTweet);
          const finalTweetURL = this.TwitterBot.buildTwitterURL(this.lastTweetId);
          console.log(latestTweet.id);
          this.TwitterBot.sendTweet(finalTweetURL, latestTweet.id);
          return;
        }
      }, 600000); // 10Mins
    }
  }

  private get69ScoreText(): string {
    let text = "";
    if (this.awayTeamScore == 69) text += "#Nice";
    if (this.awayTeamScore == 69 && this.homeTeamScore == 69) text += " ";
    if (this.homeTeamScore == 69) text += "#Nice";
    return text;
  }

  private getFirstHashtagLine(): string {
    const crushingText = this.getTeamCrushingText();
    const _69Text = this.get69ScoreText();

    if (!crushingText && !_69Text) return "";

    return `\n${crushingText}${crushingText && _69Text ? " " : ""}${_69Text}`;
  }

  private getNBAHashtagLine(): string {
    return `\n${this.getAwayVsHomeHashtag()} ${NBA.LeagueWideHashtags.NBATwitter} ${NBA.LeagueWideHashtags.NBA}`;
  }

  private getAwayVsHomeHashtag(): string {
    const homeTeamAbbreviation = NBA.GetTeamByESPNId(this.homeTeamId).abbreviation;
    const awayTeamAbbreviation = NBA.GetTeamByESPNId(this.awayTeamId).abbreviation;

    return `#${awayTeamAbbreviation}vs${homeTeamAbbreviation}`;
  }

  private getGameStatusText(): string {
    return `${this.awayTeamName} -${this.awayTeamScore} ${this.homeTeamName} -${this.homeTeamScore} ${this.Event.status.type.detail} `;
  }

  private getTeamCrushingInfo(): teamCrushingInfo | null {
    if (this.awayTeamScore - this.homeTeamScore >= 20) {
      return {
        teamName: this.awayTeamName.split(" ").join(""),
        teamHashtag: NBA.GetTeamByESPNId(this.awayTeamId).hashtag,
      };
    } else if (this.homeTeamScore - this.awayTeamScore >= 20) {
      return {
        teamName: this.homeTeamName.split(" ").join(""),
        teamHashtag: NBA.GetTeamByESPNId(this.homeTeamId).hashtag,
      };
    } else {
      return null;
    }
  }

  private getTeamCrushingText() {
    const crushingTeamInfo = this.getTeamCrushingInfo();
    return crushingTeamInfo
      ? `#The${crushingTeamInfo.teamName}${this.isCompleted ? "HaveCrushed" : "AreCrushing"} #${crushingTeamInfo.teamHashtag}`
      : "";
  }

  // Recursive-ish via scheduling next run of the same method
  private getDataAsync(): Promise<any> {
    this.refreshCount++;
    return new Promise((resolve, reject) => {
      this.fetchData().then(() => {
        //this.displayGameData();

        this.period = this.Event.competitions[0].status.period;
        let statusType = this.Event.competitions[0].status.type;
        this.statusDetail = statusType.shortDetail;

        this.isPostponed = statusType.id == statusTypeEnum.STATUS_POSTPONED;

        this.isStarted =
          statusType.id == statusTypeEnum.STATUS_IN_PROGRESS ||
          statusType.id == statusTypeEnum.STATUS_END_PERIOD ||
          statusType.id == statusTypeEnum.STATUS_HALFTIME ||
          statusType.id == statusTypeEnum.STATUS_FINAL;

        this.clockSeconds = this.Event.status.clock;

        this.isCompleted = statusType.id == statusTypeEnum.STATUS_FINAL;
        this.isEndOfPeriod = statusType.id == statusTypeEnum.STATUS_END_PERIOD;
        this.isHalftime = statusType.id == statusTypeEnum.STATUS_HALFTIME;

        this.awayTeamScore = parseInt(this.Event.competitions[0].competitors.find((e) => e.homeAway == "away").score);
        this.homeTeamScore = parseInt(this.Event.competitions[0].competitors.find((e) => e.homeAway == "home").score);

        // Sometimes end of period is flagged, but score has not yet updated. Like when a buzzer beater shot is made but is being checked by the officials to see if it counted.
        // Do one last check in 60 seconds to hopefully get a more accurate score
        // TD maybe find a way to detect inaccurate score  (exploded quarter score or tally up player scores on website)
        if (this.isCompleted || this.isEndOfPeriod || this.isHalftime) {
          let eventType = this.isEndOfPeriod || this.isHalftime ? GameEventType.EndOfPeriod : GameEventType.Final;
          let periodValue = this.isEndOfPeriod || this.isHalftime ? this.period : 0; // Return 0 for completed games, bc thats what we hardcoded into the event object for those.. //td take that 0 default out
          let event = this.getGameEventByType(eventType, periodValue);

          //If we havent delayed for this event yet, wait 60seconds before  continuing
          if (!event.delayed) {
            console.log();
            console.log(this.getGameStatusText());
            console.log(`Delaying before tweeting`);
            console.log();
            Scheduler.scheduleThis(() => {
              this.getDataAsync();
            }, Scheduler.addMinutesToNow(1));

            event.delayed = true; // This is not the game event, but rather the event/act of sending a tweet for a particular quarter or started/final.
            event.gameText = this.getGameStatusText();
            return;
          }
        }

        this.liveTweet();

        // If postponed, end the game
        if (this.isPostponed) {
          return;
        }

        // If game is over, make the save file and do not refresh the game again
        if (this.isCompleted) {
          this.generateSave();
          console.log(`Refreshes: ${this.refreshCount} `);

          this.startDidTeamWinInterval("home");
          this.startDidTeamWinInterval("away");
          return;
        }

        Scheduler.scheduleThis(() => {
          this.getDataAsync();
        }, this.getNextRefreshTime());
      });
    });
  }

  public getNextRefreshTime(): Date {
    let nextRefreshDate = new Date();

    let nextRefreshSeconds = 0;

    if (!this.isStarted) {
      // Calclulate number of seconds until the game is scheduled to start and try again
      nextRefreshSeconds = (new Date(this.gameStartDateTime).getTime() - new Date().getTime()) / 1000;
    } else if ((this.isEndOfPeriod && this.period != 4) || this.isHalftime) {
      nextRefreshSeconds = 60 * 3;
    } else {
      nextRefreshSeconds = this.clockSeconds;
    }

    // Ensure quickest refresh is 10 seconds
    nextRefreshSeconds = nextRefreshSeconds < 10 ? 10 : nextRefreshSeconds;
    nextRefreshDate.setSeconds(nextRefreshDate.getSeconds() + nextRefreshSeconds);

    console.log(
      `${this.awayTeamName} -${this.awayTeamScore} ${this.homeTeamName} -${this.homeTeamScore} ${
        this.Event.status.type.detail
      } \nNext refresh: ${nextRefreshDate.toLocaleTimeString()} \n`
    );
    return nextRefreshDate;
  }

  public generateSave(): any {
    if (this.isDebug) return;
    let basketballGameScraper = new BasketballGameScraper(this.gameId);
    basketballGameScraper.init().then(() => {
      let saveFile = {
        GameId: this.gameId,
        VenueId: this.venueId,
        Date: this.Event.date,

        AwayTeamId: this.awayTeamId,
        HomeTeamId: this.homeTeamId,

        GameURL: ESPN.boxScore + this.gameId,

        Competitors: this.awayTeamName + "-" + this.homeTeamName,
        GameDescription: this.Event.name,

        AwayScore: this.Event.competitions[0].competitors.find((e) => e.homeAway == "away").score,
        AwayPlayers: basketballGameScraper.generateTeamPlayerData(false),

        HomeScore: this.Event.competitions[0].competitors.find((e) => e.homeAway == "home").score,
        HomePlayers: basketballGameScraper.generateTeamPlayerData(true),

        IsAccurate: "Not implemented",
      };

      Helpers.makeJson(saveFile, this.generateFileName());
    });
  }

  private generateFileName(ret?): string {
    return `${this.gameId}_${this.awayTeamName} -${this.homeTeamName} `;
  }

  public run(): void {
    this.startScheduleLoop();
  }

  private startScheduleLoop(): void {
    this.getDataAsync();
  }
}

export class APIReturn {
  public day: day;
  public events: event[];
}

export class day {
  public date: string;
}
export class seasonLite {
  public year: number;
  public type: number;
}

export class season {
  public year: number;
  public type: number;
}

export class league {}

export class event {
  public id: string;
  public uid: string;
  public date: string;
  public name: string;
  public shortName: string;
  public competitions: competition[];
  public links: link[];
  public status: status;
}

export class link {
  public language: string;
  public href: string;
  public text: string;
  public shortText: string;
  public isExternal: boolean;
  public isPremium: boolean;
}

export class competition {
  public id: string;
  public uid: string;
  public date: string;
  public attendance: number;
  public timeValid: boolean;
  public neutralSite: boolean;
  public conferenceCompetition: boolean;
  public venue: venue;
  public competitors: competitor[];
  public notes: string[];
  public status: status;
  public startDate: string;
  //public broadcasts: broadcast[];
  //public geoBroadcasts: geoBroadcast[];
  //public headlines: headline[];
}

export class status {
  public clock: number;
  public displayClock: string;
  public period: number; //Normal Game: 0 1 2 3 4 Overtime : 5 6.... etc
  public type: statusType;
}

export class statusType {
  public id: statusTypeEnum;
  public name: string;
  public state: string; // pre - in - post
  public completed: boolean;
  public description: string;
  public detail: string;
  public shortDetail: string;
}

export enum statusTypeEnum {
  STATUS_SCHEDULED = 1,
  STATUS_IN_PROGRESS = 2,
  STATUS_FINAL = 3,
  //STATUS_  = 4,
  //STATUS_  = 5,
  STATUS_POSTPONED = 6,
  STATUS_END_PERIOD = 22,
  STATUS_HALFTIME = 23,
}

export class venue {
  public id: string;
  public fullName: string;
  public address: address;
  public capacity: number;
  public indoor: boolean;
}

export class address {
  public city: string;
  public state: string;
}

export class competitor {
  public id: string;
  public uid: string;
  public type: string;
  public order: number;
  public homeAway: string;
  public winner: boolean;
  public team: team;
  public score: string;
}

export class team {
  public id: string;
  public uid: string;
  public location: string;
  public name: string;
  public abbreviation: string;
  public displayName: string;
  public shortDisplayName: string;
  public color: string;
  public alternateColor: string;
  public isActive: boolean;
  public score: string;
}

export interface teamCrushingInfo {
  teamName: string;
  teamHashtag: string;
}

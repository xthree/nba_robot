const rp = require("request-promise");
const EventEmitter = require("events");
const eventEmitter = new EventEmitter();

import { Twitter } from "./twitter";
import { ESPN } from "./helpers/ESPN";
import { Helpers } from "./helpers/helpers";
import { Scheduler } from "./helpers/scheduler";
import { BasketballGameScraper } from "./basketballGameScraper";

export enum GameEventType {
  Started = 0,
  Eo1 = 1, //End of first Quarter
  Eo2 = 2,
  Eo3 = 3,
  Eo4 = 4,
  Final = 5,
  EoOT = 6,
  EoOT2 = 7,
  EoOT3 = 8
}

export class GameEvent {
  public type: GameEventType;
  public finished: boolean;
  constructor(pType: GameEventType) {
    this.type = pType;
    this.finished = false;
  }
}

export class BasketballGame {
  private refreshCount = 0;
  public gameId: string;
  public gameStartDateTime: string; // eg 2021-01-11T01:00Z
  private TwitterBot: Twitter;

  public Event: event;
  public TweetEvents: GameEvent[] = [];

  public isDebug: boolean = false;

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
  public awayTeamScore: string;

  public homeTeamId: string;
  public homeTeamName: string;
  public homeTeamScore: string;

  public constructor(pGameId: string) {
    console.log(pGameId);
    this.gameId = pGameId;
    this.TwitterBot = new Twitter(this.isDebug); // CHANGE THIS TO FALSE TO ENABLE TWEETING
  }

  public isTiedGame(): boolean {
    return this.awayTeamScore == this.homeTeamScore;
  }

  public initGame(): Promise<any> {
    this.TweetEvents.push(new GameEvent(GameEventType.Started));
    this.TweetEvents.push(new GameEvent(GameEventType.Eo1));
    this.TweetEvents.push(new GameEvent(GameEventType.Eo2));
    this.TweetEvents.push(new GameEvent(GameEventType.Eo3));
    this.TweetEvents.push(new GameEvent(GameEventType.Eo4));
    this.TweetEvents.push(new GameEvent(GameEventType.Final));

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

    let awayScore = this.Event.competitions[0].competitors.find((e) => e.homeAway == "away").score;
    let awayTeamName = this.Event.competitions[0].competitors.find((e) => e.homeAway == "away").team.name;

    let homeScore = this.Event.competitions[0].competitors.find((e) => e.homeAway == "home").score;
    let homeTeamName = this.Event.competitions[0].competitors.find((e) => e.homeAway == "home").team.name;

    console.log(`${awayTeamName}-${awayScore}`);
    console.log(`${homeTeamName}-${homeScore}`);
    console.log();
  }

  private getGameEventType(pGameEventType: GameEventType) {
    let event = this.TweetEvents.find((e) => {
      return e.type == pGameEventType;
    });
    return event;
  }

  private liveTweet() {
    let event: GameEvent;

    if (this.isPostponed) {
      this.TwitterBot.sendTweet(`${this.awayTeamName} ${this.homeTeamName}\nGame has been postponed`);
      return;
    }

    if (this.isStarted) {
      event = this.getGameEventType(GameEventType.Started);

      if (!event.finished) {
        this.TwitterBot.sendTweet(`${this.awayTeamName} ${this.homeTeamName}\nGame has started`);
        event.finished = true;
      }

      let tweetMsg = `${this.statusDetail}\n${this.awayTeamName}-${this.awayTeamScore} ${this.homeTeamName}-${this.homeTeamScore}`;

      if (this.isEndOfPeriod || this.isHalftime) {
        switch (this.period) {
          case 1:
            event = this.getGameEventType(GameEventType.Eo1);
            break;
          case 2:
            event = this.getGameEventType(GameEventType.Eo2);
            break;
          case 3:
            event = this.getGameEventType(GameEventType.Eo3);
            break;
          case 4:
            event = this.getGameEventType(GameEventType.Eo4);
            break;
          default:
            console.log("UNKNOWN PERIOD " + this.period);
            break;
        }

        // Only tweet End of 4th if going into overtime / tied game
        if (this.period == 4 && !this.isTiedGame()) {
          //do nothing
        } else {
          if (!event.finished) {
            this.TwitterBot.sendTweet(tweetMsg);
            event.finished = true;
          }
        }
      }
    }

    if (this.isCompleted) {
      event = this.getGameEventType(GameEventType.Final);
      let tweetMsg = `${this.statusDetail}\n${this.awayTeamName}-${this.awayTeamScore} ${this.homeTeamName}-${this.homeTeamScore}`;

      this.TwitterBot.sendTweet(tweetMsg);
      event.finished = true;
    }
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

        this.awayTeamScore = this.Event.competitions[0].competitors.find((e) => e.homeAway == "away").score;
        this.homeTeamScore = this.Event.competitions[0].competitors.find((e) => e.homeAway == "home").score;

        this.liveTweet();

        // If postponed, end the game
        if (this.isPostponed) {
          return;
        }

        if (this.isCompleted) {
          this.generateSave();
          console.log(`Refreshes: ${this.refreshCount}`);
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
      `${this.awayTeamName}-${this.awayTeamScore} ${this.homeTeamName}-${this.homeTeamScore} ${
        this.Event.status.type.detail}\nNext refresh: ${nextRefreshDate.toLocaleTimeString()}`
    );
    return nextRefreshDate;
  }

  public generateSave(): any {
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

      Helpers.makeFile(saveFile, this.generateFileName());
    });
  }

  private generateFileName(ret?): string {
    return `${this.gameId}_${this.awayTeamName + "-" + this.homeTeamName}_${this.gameStartDateTime}`;
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
  public period: number; //0 1 2 3 4
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

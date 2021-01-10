const rp = require("request-promise");
const fs = require("fs");

import { Twitter } from "./twitter";
import { Team } from "./team";
import { ESPN } from "./helpers/ESPN";
import { Helpers } from "./helpers/helpers";

export class newBasketballGame {
  public gameId: string;
  public nextRefresh: Date;

  public newBasketballGame(pGameId: string) {
    this.gameId = pGameId;
  }

  public getDataAsync(): void {
    return rp(ESPN.hiddenAPI).then((data: APIReturn) => {
        console.log(data);
    });
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
  public period: number;
}
export class statusType {
  public id: string;
  public name: string;
  public state: string;
  public completed: boolean;
  public description: string;
  public detail: string;
  public shortDetail: string;
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

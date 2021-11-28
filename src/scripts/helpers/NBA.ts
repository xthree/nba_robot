export class NBA {
  private static Teams: Array<NBATeam> = [
    {
      "id": 1,
      "abbreviation": "ATL",
      "teamName": "Atlanta Hawks",
      "mascot": "Hawks",
      "location": "Atlanta",
      "hashtag": "TrueToAtlanta",
      "twitterHandle": "ATLHawks"
    },
    {
      "id": 2,
      "abbreviation": "BOS",
      "teamName": "Boston Celtics",
      "mascot": "Celtics",
      "location": "Boston",
      "hashtag": "BleedGreen",
      "twitterHandle": "celtics"
    },
    {
      "id": 3,
      "abbreviation": "NOP",
      "teamName": "New Orleans Pelicans",
      "mascot": "Pelicans",
      "location": "New Orleans",
      "hashtag": "WBD",
      "twitterHandle": "PelicansNBA"
    },
    {
      "id": 4,
      "abbreviation": "CHI",
      "teamName": "Chicago Bulls",
      "mascot": "Bulls",
      "location": "Chicago",
      "hashtag": "BullsNation",
      "twitterHandle": "chicagobulls"
    },
    {
      "id": 5,
      "abbreviation": "CLE",
      "teamName": "Cleveland Cavaliers",
      "mascot": "Cavaliers",
      "location": "Cleveland",
      "hashtag": "BeTheFight",
      "twitterHandle": "cavs"
    },
    {
      "id": 6,
      "abbreviation": "DAL",
      "teamName": "Dallas Mavericks",
      "mascot": "Mavericks",
      "location": "Dallas",
      "hashtag": "MFFL",
      "twitterHandle": "dallasmavs"
    },
    {
      "id": 7,
      "abbreviation": "DEN",
      "teamName": "Denver Nuggets",
      "mascot": "Nuggets",
      "location": "Denver",
      "hashtag": "MileHighBasketball",
      "twitterHandle": "nuggets"
    },
    {
      "id": 8,
      "abbreviation": "DET",
      "teamName": "Detroit Pistons",
      "mascot": "Pistons",
      "location": "Detroit",
      "hashtag": "Pistons",
      "twitterHandle": "DetroitPistons"
    },
    {
      "id": 9,
      "abbreviation": "GSW",
      "teamName": "Golden State Warriors",
      "mascot": "Warriors",
      "location": "Golden State",
      "hashtag": "DubNation",
      "twitterHandle": "warriors"
    },
    {
      "id": 10,
      "abbreviation": "HOU",
      "teamName": "Houston Rockets",
      "mascot": "Rockets",
      "location": "Houston",
      "hashtag": "Rockets",
      "twitterHandle": "HoustonRockets"
    },
    {
      "id": 11,
      "abbreviation": "IND",
      "teamName": "Indiana Pacers",
      "mascot": "Pacers",
      "location": "Indiana",
      "hashtag": "GoldBlooded",
      "twitterHandle": "Pacers"
    },
    {
      "id": 12,
      "abbreviation": "LAC",
      "teamName": "Los Angeles Clippers",
      "mascot": "Clippers",
      "location": "Los Angeles",
      "hashtag": "ClipperNation",
      "twitterHandle": "LAClippers"
    },
    {
      "id": 13,
      "abbreviation": "LAL",
      "teamName": "Los Angeles Lakers",
      "mascot": "Lakers",
      "location": "Los Angeles",
      "hashtag": "LakeShow",
      "twitterHandle": "Lakers"
    },
    {
      "id": 14,
      "abbreviation": "MIA",
      "teamName": "Miami Heat",
      "mascot": "Heat",
      "location": "Miami",
      "hashtag": "HEATCulture",
      "twitterHandle": "MiamiHEAT"
    },
    {
      "id": 15,
      "abbreviation": "MIL",
      "teamName": "Milwaukee Bucks",
      "mascot": "Bucks",
      "location": "Milwaukee",
      "hashtag": "FearTheDeer",
      "twitterHandle": "bucks"
    },
    {
      "id": 16,
      "abbreviation": "MIN",
      "teamName": "Minnesota Timberwolves",
      "mascot": "Timberwolves",
      "location": "Minnesota",
      "hashtag": "RaisedByWolves",
      "twitterHandle": "Timberwolves"
    },
    {
      "id": 17,
      "abbreviation": "BKN",
      "teamName": "Brooklyn Nets",
      "mascot": "Nets",
      "location": "Brooklyn",
      "hashtag": "NetsWorld",
      "twitterHandle": "BrooklynNets"
    },
    {
      "id": 18,
      "abbreviation": "NYK",
      "teamName": "New York Knicks",
      "mascot": "Knicks",
      "location": "New York",
      "hashtag": "NewYorkForever",
      "twitterHandle": "nyknicks"
    },
    {
      "id": 19,
      "abbreviation": "ORL",
      "teamName": "Orlando Magic",
      "mascot": "Magic",
      "location": "Orlando",
      "hashtag": "MagicTogether",
      "twitterHandle": "OrlandoMagic"
    },
    {
      "id": 20,
      "abbreviation": "PHI",
      "teamName": "Philadelphia 76ers",
      "mascot": "76ers",
      "location": "Philadelphia",
      "hashtag": "HereTheyCome",
      "twitterHandle": "sixers"
    },
    {
      "id": 21,
      "abbreviation": "PHX",
      "teamName": "Phoenix Suns",
      "mascot": "Suns",
      "location": "Phoenix",
      "hashtag": "ValleyProud",
      "twitterHandle": "Suns"
    },
    {
      "id": 22,
      "abbreviation": "POR",
      "teamName": "Portland Trail Blazers",
      "mascot": "Trail Blazers",
      "location": "Portland",
      "hashtag": "RipCity",
      "twitterHandle": "trailblazers"
    },
    {
      "id": 23,
      "abbreviation": "SAC",
      "teamName": "Sacramento Kings",
      "mascot": "Kings",
      "location": "Sacramento",
      "hashtag": "SacramentoProud",
      "twitterHandle": "SacramentoKings"
    },
    {
      "id": 24,
      "abbreviation": "SAS",
      "teamName": "San Antonio Spurs",
      "mascot": "Spurs",
      "location": "San Antonio",
      "hashtag": "PorVida",
      "twitterHandle": "spurs"
    },
    {
      "id": 25,
      "abbreviation": "OKC",
      "teamName": "Oklahoma City Thunder",
      "mascot": "Thunder",
      "location": "Oklahoma City",
      "hashtag": "ThunderUp",
      "twitterHandle": "okcthunder"
    },
    {
      "id": 26,
      "abbreviation": "UTA",
      "teamName": "Utah Jazz",
      "mascot": "Jazz",
      "location": "Utah",
      "hashtag": "TakeNote",
      "twitterHandle": "utahjazz"
    },
    {
      "id": 27,
      "abbreviation": "WAS",
      "teamName": "Washington Wizards",
      "mascot": "Wizards",
      "location": "Washington",
      "hashtag": "DCAboveAll",
      "twitterHandle": "WashWizards"
    },
    {
      "id": 28,
      "abbreviation": "TOR",
      "teamName": "Toronto Raptors",
      "mascot": "Raptors",
      "location": "Toronto",
      "hashtag": "WeTheNorth",
      "twitterHandle": "Raptors"
    },
    {
      "id": 29,
      "abbreviation": "MEM",
      "teamName": "Memphis Grizzlies",
      "mascot": "Grizzlies",
      "location": "Memphis",
      "hashtag": "GrindCity",
      "twitterHandle": "memgrizz"
    },
    {
      "id": 30,
      "abbreviation": "CHA",
      "teamName": "Charlotte Hornets",
      "mascot": "Hornets",
      "location": "Charlotte",
      "hashtag": "AllFly",
      "twitterHandle": "hornets"
    }
  ]

  public static LeagueWideHashtags = {
    NBA: "NBA", NBA75: "NBA75", NBATwitter: "NBATwitter"
  };

  public static GetTeamByESPNId(id): NBATeam {
    return this.Teams.find((team) => team.id == id);
  }
}

export class NBATeam {
  public id: number;
  public abbreviation: string;
  public teamName: string;
  public mascot: string;
  public location: string;
  public hashtag: string;
  public twitterHandle: string;
}

let $: any;
// Gets an array of team display name and abbrevition from the ESPN NBA Teams page
// Working as of November 2020
// https://www.espn.com/nba/teams
function getTeamNames() {
  let teamArray = [];
  let x = $("body").find(".TeamLinks").toArray();

  for (let a of x) {
    let $e = $(a);
    let name = $e.find("img").attr("alt");

    let url = $e.find("a").attr("href");
    let urlSegments = url.split("/");
    let abbr = urlSegments[5];

    teamArray.push({
      displayName: name,
      abbreviation: abbr,
    });
  }

  console.log(teamArray);
}



let teamstring = "[{\"displayName\":\"Boston Celtics\",\"abbreviation\":\"bos\"},{\"displayName\":\"Brooklyn Nets\",\"abbreviation\":\"bkn\"},{\"displayName\":\"New York Knicks\",\"abbreviation\":\"ny\"},{\"displayName\":\"Philadelphia 76ers\",\"abbreviation\":\"phi\"},{\"displayName\":\"Toronto Raptors\",\"abbreviation\":\"tor\"},{\"displayName\":\"Chicago Bulls\",\"abbreviation\":\"chi\"},{\"displayName\":\"Cleveland Cavaliers\",\"abbreviation\":\"cle\"},{\"displayName\":\"Detroit Pistons\",\"abbreviation\":\"det\"},{\"displayName\":\"Indiana Pacers\",\"abbreviation\":\"ind\"},{\"displayName\":\"Milwaukee Bucks\",\"abbreviation\":\"mil\"},{\"displayName\":\"Denver Nuggets\",\"abbreviation\":\"den\"},{\"displayName\":\"Minnesota Timberwolves\",\"abbreviation\":\"min\"},{\"displayName\":\"Oklahoma City Thunder\",\"abbreviation\":\"okc\"},{\"displayName\":\"Portland Trail Blazers\",\"abbreviation\":\"por\"},{\"displayName\":\"Utah Jazz\",\"abbreviation\":\"utah\"},{\"displayName\":\"Golden State Warriors\",\"abbreviation\":\"gs\"},{\"displayName\":\"LA Clippers\",\"abbreviation\":\"lac\"},{\"displayName\":\"Los Angeles Lakers\",\"abbreviation\":\"lal\"},{\"displayName\":\"Phoenix Suns\",\"abbreviation\":\"phx\"},{\"displayName\":\"Sacramento Kings\",\"abbreviation\":\"sac\"},{\"displayName\":\"Atlanta Hawks\",\"abbreviation\":\"atl\"},{\"displayName\":\"Charlotte Hornets\",\"abbreviation\":\"cha\"},{\"displayName\":\"Miami Heat\",\"abbreviation\":\"mia\"},{\"displayName\":\"Orlando Magic\",\"abbreviation\":\"orl\"},{\"displayName\":\"Washington Wizards\",\"abbreviation\":\"wsh\"},{\"displayName\":\"Dallas Mavericks\",\"abbreviation\":\"dal\"},{\"displayName\":\"Houston Rockets\",\"abbreviation\":\"hou\"},{\"displayName\":\"Memphis Grizzlies\",\"abbreviation\":\"mem\"},{\"displayName\":\"New Orleans Pelicans\",\"abbreviation\":\"no\"},{\"displayName\":\"San Antonio Spurs\",\"abbreviation\":\"sa\"}]";
let teams = JSON.parse(teamstring);

function getNameFromAbb(pAbbr) {
  for (let team of teams) {
    if (team.abbreviation == pAbbr) {
      return team.displayName;
    }
  }
  console.log("didnt find the team")
}
var jsdom = require("jsdom");
const { JSDOM } = jsdom;
window = new JSDOM();
document = (new JSDOM('')).window;
global.document = document;
//@ts-ignore
$ = jQuery = require('jquery')(new jsdom.JSDOM().window);

const rp = require('request-promise');
//let jsonFile = require('jsonfile');
const fs = require('fs');

// TWITTER
var OAuth = require('oauth');



class BasketballGame {
  private $pageWrapper: JQuery;
  private $wrapper: JQuery;
  public $headerWrapper: JQuery;

  private description: string;
  public airingNetwork: string;

  private hasGameStarted = false;
  public isConcluded: boolean = false;
  private gameConcludedInOvertime: boolean = false;
  private URL: string;

  private currentQuarter: number;
  public currentTime: string;
  private lastTime: string;
  private lastScore: number;
  private isEndOfQuarter: boolean = true;
  private haveDisplayedEndOfQuarter: boolean = false;
  private haveDisplayedStartOfGame: boolean = false;

  private homeTeam: Team;
  private awayTeam: Team;

  private outputLog: string = "";

  constructor(gameId: string) {
    this.URL = `https://www.espn.com/nba/boxscore?gameId=${gameId}`;

    this.fetchPage().then((html) => {
      //console.log(html)
      this.setUpContainers(html);
      //this.setUpTeamContainers();
      this.initializeTeams();

      this.refresh().then(() => {
        if (this.isConcluded) {
          // If bot is started after the game has concluded, the run will not happen, and thus no generation of post-game files
          return;
        }

        this.run();
      });
    });
  }

  private generateSaveFile() {

    console.log("generating")
    var ret = {
      GameURL: this.URL,
      Competitors: this.awayTeam.name + "-" + this.homeTeam.name,
      GameDescription: this.description,
      AiringNetwork: this.airingNetwork,
      AwayScore: this.getAwayTeamScore(),
      HomeScore: this.getHomeTeamScore(),
      AwayPlayers: this.awayTeam.players,
      HomePlayers: this.homeTeam.players
    }
    let json = JSON.stringify(ret);
    console.log(json)


    const date = new Date()
    const dateTimeFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit' })
    const [{ value: month }, , { value: day }, , { value: year }] = dateTimeFormat.formatToParts(date);

    var dateText = `${day}-${month}-${year}`;

    var fileName = `${ret.Competitors} ${dateText}`;




    fs.writeFile(`/output/${fileName}.json`, json, (e) => {
      console.log("error")
      console.log(e);
    });

    fs.writeFile(`/output/${fileName} Log.txt`, this.outputLog, (e) => {
      console.log("error")
      console.log(e);
    });
  }

  public refresh(): any {
    return this.fetchPage().then((html) => {
      this.setUpContainers(html);
      this.setUpTeamContainers();
      this.updateGameData();
    }).catch((error) => {
      //console.log(error);
    });
  }

  private run() {
    let updateTime = 5000;
    var intervalId =
      setInterval(() => {
        //console.log("refreshing")
        this.refresh().then(() => {
          if (this.isConcluded) {
            this.generateSaveFile();
            clearInterval(intervalId);
            return false;
          }
        });
      }, updateTime);
  }


  public fetchPage(): Promise<any> {
    return rp(this.URL);
  }

  public updateGameData() {
    this.description = this.$headerWrapper.find('.game-details').text().trim();
    this.airingNetwork = this.$headerWrapper.find('.game-status .network').text().trim();

    this.hasGameStarted = this.$wrapper.text().trim() != "No Box Score Available";
    this.currentTime = this.$headerWrapper.find('.game-status .game-time').text().trim();
    //@ts-ignore
    this.isEndOfQuarter = this.currentTime.includes("End") || this.currentTime.includes("Half");
    this.isConcluded = this.currentTime.includes("Final");

    let homeTeamScore = this.getHomeTeamScore();
    let awayTeamScore = this.getAwayTeamScore();
    let combinedScore = homeTeamScore + awayTeamScore;

    this.homeTeam.updateTeamData(homeTeamScore, this.isConcluded);
    this.awayTeam.updateTeamData(awayTeamScore, this.isConcluded);

    // Block display 
    if ((this.isEndOfQuarter && !this.haveDisplayedEndOfQuarter) || (!this.hasGameStarted && !this.haveDisplayedEndOfQuarter)) {
      if (!this.hasGameStarted) {
        let msg = "Game has not yet started";
        this.outputLog += msg;
        console.log(msg);
        this.haveDisplayedEndOfQuarter = true;

        return;
      }

      if (this.hasGameStarted && !this.haveDisplayedStartOfGame) {
        this.sendTweet(`${this.awayTeam.name} ${this.homeTeam.name}\nGame has started`);
      }

      let msg = `\n${this.currentTime}\n${this.awayTeam.name}-${this.awayTeam.score} ${this.homeTeam.name}-${this.homeTeam.score}`;
      console.log(msg);
      this.outputLog += msg;

      this.sendTweet(msg);

      this.haveDisplayedEndOfQuarter = true;
      return;
    }
    else if ((this.isEndOfQuarter && this.haveDisplayedEndOfQuarter) || (!this.hasGameStarted && this.haveDisplayedEndOfQuarter)) {
      return; //Wait until game starts again
    }

    // 
    if ((this.lastTime != this.currentTime && combinedScore != this.lastScore) || this.isConcluded) {
      let msg = `\n${this.currentTime}  ${this.awayTeam.name}-${this.awayTeam.score} ${this.homeTeam.name}-${this.homeTeam.score}`;
      console.log(msg);

      if (this.isConcluded) {
        this.sendTweet(msg);
      }


      this.outputLog += msg;

      this.haveDisplayedEndOfQuarter = false;
      this.lastTime = this.currentTime;
      this.lastScore = combinedScore;
    }
  }

  public setUpContainers(pHtml: string) {
    this.$pageWrapper = $(pHtml);
    this.$wrapper = this.$pageWrapper.find('#gamepackage-box-score');
    this.$headerWrapper = this.$pageWrapper.find('#gamepackage-matchup-wrap');
  }

  public setUpTeamContainers() {
    this.homeTeam.updateContainer(this.$wrapper.find('.gamepackage-home-wrap'));
    this.awayTeam.updateContainer(this.$wrapper.find('.gamepackage-away-wrap'));
  }

  public initializeTeams() {
    let $homeWrapper = this.$wrapper.find('.gamepackage-home-wrap')
    let $homeHeaderWrapper = this.$headerWrapper.find('.team.home');
    let homeTeamUID = $homeHeaderWrapper.find('.team-name').data("clubhouse-uid");
    let homeTeamLocation = $homeHeaderWrapper.find('.long-name').text().trim();
    let homeTeamName = $homeHeaderWrapper.find('.team-name .short-name').text().trim();
    let homeTeamNameAbbreviation = $homeHeaderWrapper.find('.team-name .abbrev').text().trim();

    let $awayWrapper = this.$wrapper.find('.gamepackage-away-wrap');
    let $awayHeaderWrapper = this.$headerWrapper.find('.team.away');
    let awayTeamUID = $awayHeaderWrapper.find('.team-name').data("clubhouse-uid");
    let awayTeamLocation = $awayHeaderWrapper.find('.team-name .long-name').text().trim();
    let awayTeamName = $awayHeaderWrapper.find('.team-name .short-name').text().trim();
    let awayTeamNameAbbreviation = $awayHeaderWrapper.find('.team-name .abbrev').text().trim();

    this.homeTeam = new Team($homeWrapper, homeTeamUID, homeTeamLocation, homeTeamName, homeTeamNameAbbreviation, true);
    this.awayTeam = new Team($awayWrapper, awayTeamUID, awayTeamLocation, awayTeamName, awayTeamNameAbbreviation, false);
  }

  public getHomeTeamScore() {
    return parseInt(this.$headerWrapper.find('.team.home .score').text().trim());
  }

  public getAwayTeamScore() {
    return parseInt(this.$headerWrapper.find('.team.away .score').text().trim());
  }

  private sendTweet(pTweetMessage: string) {
    var twitter_application_consumer_key = '2SeL89M9cIrfk7MASkX8hP3CC';  // API Key
    var twitter_application_secret = '5iAgRIgMIu663XXuB0h0nFGfvxhmP0TmkagoFfxSgyF40EkBql';  // API Secret
    var twitter_user_access_token = '1302720585709961216-3nfc7WAxpZ306L4CZttRBvkd4rg3gq';  // Access Token
    var twitter_user_secret = 'gsWYCH4fA7vz4k7Da0A7mhqUlag1pbDy42TrktvkHUdYI';  // Access Token Secret


    var oauth = new OAuth.OAuth(
      'https://api.twitter.com/oauth/request_token',
      'https://api.twitter.com/oauth/access_token',
      twitter_application_consumer_key,
      twitter_application_secret,
      '1.0A',
      null,
      'HMAC-SHA1'
    );

    var status = pTweetMessage;  // This is the tweet (ie status)

    var postBody = {
      'status': status
    };

    // console.log('Ready to Tweet article:\n\t', postBody.status);
    oauth.post('https://api.twitter.com/1.1/statuses/update.json',
      twitter_user_access_token,  // oauth_token (user access token)
      twitter_user_secret,  // oauth_secret (user secret)
      postBody,  // post body
      '',  // post content type ?
      function (err, data, res) {
        if (err) {
          console.log(err);
        } else {
          // console.log(data);
        }
      });
  }
}


class Team {
  private $wrapper: JQuery;
  private isHomeTeam: boolean;
  private UID: string;
  private location: string;
  public name: string;
  private nameAbbreviation: string;
  public score: number;
  private record: string;
  public players: Player[];

  constructor(pWrapper: JQuery, pUID: string, pLocation: string, pTeamName: string, pTeamNameAbbreviation: string, pIsHomeTeam: boolean) {
    this.$wrapper = $(pWrapper);
    this.isHomeTeam = pIsHomeTeam;
    this.UID = pUID;
    this.location = pLocation;
    this.name = pTeamName;
    this.nameAbbreviation = pTeamNameAbbreviation;
  }

  public updateTeamData(pScore: number, pGeneratePlayerData: boolean = false) {
    this.score = pScore;
    if (pGeneratePlayerData) {
      this.generatePlayerData();
    }
  }

  public updateContainer($pNewWrapper: JQuery) {
    this.$wrapper = $pNewWrapper;
  }

  public generatePlayerData() {
    let $players = this.$wrapper.find("tbody tr").not('.highlight');
    this.players = [];

    // Counts score for accuracy check
    let scoreCount = 0;

    $players.each((i, row) => {
      this.players.push(new Player($(row)));
      scoreCount += isNaN(this.players[i].points) ? 0 : this.players[i].points;
    });

    //scoreCount == this.score ? "" : console.warn(`scores do not match. Expected ${this.score}. Got ${scoreCount}`)
  }
}

class Player {
  private UID: string;
  private name: string;
  private minutes: number;
  private fieldGoals: string;
  private threePoints: string;
  private freeThrows: string;
  private offensiveRebounds: number;
  private defensiveRebounds: number;
  private totalRebounds: number;
  private assists: number;
  private steals: number;
  private blocks: number;
  private turnOvers: number;
  private personalFouls: number;
  private plusMinus: number;
  public points: number;


  constructor(pRow: JQuery) {
    this.name = pRow.find('.name a span').first().text().trim();
    this.minutes = parseInt(pRow.find('.min').text().trim());
    this.fieldGoals = pRow.find('.fg').text().trim();
    this.threePoints = pRow.find('.3pt').text().trim();
    this.freeThrows = pRow.find('.ft').text().trim();
    this.offensiveRebounds = parseInt(pRow.find('.oreb').text().trim());
    this.defensiveRebounds = parseInt(pRow.find('.dreb').text().trim());
    this.totalRebounds = parseInt(pRow.find('.reb').text().trim());
    this.assists = parseInt(pRow.find('.ast').text().trim());
    this.steals = parseInt(pRow.find('.stl').text().trim());
    this.blocks = parseInt(pRow.find('.blk').text().trim());
    this.turnOvers = parseInt(pRow.find('.to').text().trim());
    this.personalFouls = parseInt(pRow.find('.pf').text().trim());
    this.plusMinus = parseInt(pRow.find('.plusminus').text().trim());
    this.points = parseInt(pRow.find('.pts').text().trim());
  }
}


rp("http://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard").then((e) => {
  var data = JSON.parse(e);

  console.log(data.events);

});


//let game = new BasketballGame("401241769");
//let game2 = new BasketballGame("401242802");
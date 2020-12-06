import { Twitter } from "../twitter";
let jsdom = require("jsdom");
let $ = require("jquery")(new jsdom.JSDOM().window);

const rp = require("request-promise");



//Create Object and .run()

export class DraftTweeter {
    public Tweeter = new Twitter(false);
    public teams: any[];
  
    public haveTweetedArray = [];
  
    constructor() {
      this.teams = JSON.parse(
        '[{"displayName":"Boston Celtics","abbreviation":"bos"},{"displayName":"Brooklyn Nets","abbreviation":"bkn"},{"displayName":"New York Knicks","abbreviation":"ny"},{"displayName":"Philadelphia 76ers","abbreviation":"phi"},{"displayName":"Toronto Raptors","abbreviation":"tor"},{"displayName":"Chicago Bulls","abbreviation":"chi"},{"displayName":"Cleveland Cavaliers","abbreviation":"cle"},{"displayName":"Detroit Pistons","abbreviation":"det"},{"displayName":"Indiana Pacers","abbreviation":"ind"},{"displayName":"Milwaukee Bucks","abbreviation":"mil"},{"displayName":"Denver Nuggets","abbreviation":"den"},{"displayName":"Minnesota Timberwolves","abbreviation":"min"},{"displayName":"Oklahoma City Thunder","abbreviation":"okc"},{"displayName":"Portland Trail Blazers","abbreviation":"por"},{"displayName":"Utah Jazz","abbreviation":"utah"},{"displayName":"Golden State Warriors","abbreviation":"gs"},{"displayName":"LA Clippers","abbreviation":"lac"},{"displayName":"Los Angeles Lakers","abbreviation":"lal"},{"displayName":"Phoenix Suns","abbreviation":"phx"},{"displayName":"Sacramento Kings","abbreviation":"sac"},{"displayName":"Atlanta Hawks","abbreviation":"atl"},{"displayName":"Charlotte Hornets","abbreviation":"cha"},{"displayName":"Miami Heat","abbreviation":"mia"},{"displayName":"Orlando Magic","abbreviation":"orl"},{"displayName":"Washington Wizards","abbreviation":"wsh"},{"displayName":"Dallas Mavericks","abbreviation":"dal"},{"displayName":"Houston Rockets","abbreviation":"hou"},{"displayName":"Memphis Grizzlies","abbreviation":"mem"},{"displayName":"New Orleans Pelicans","abbreviation":"no"},{"displayName":"San Antonio Spurs","abbreviation":"sa"}]'
      );
    }
  
    public run() {
      rp("https://www.espn.com/nba/draft/rounds/_/round/2").then((html) => {
        let teamElements = $(html).find(".draftTable__header").toArray();
        let pickCount = 1 + 30;
        for (let team of teamElements) {
          let $team = $(team);
  
          let teamURL = $team.find(".draftTable__headline--team img").attr("src");
  
          let endSub = teamURL.indexOf(".png");
  
          let teamAbbr = teamURL.substring(69, endSub);
          let teamName = this.getNameFromAbb(teamAbbr);
  
          let playerName = $team
            .find(".draftTable__headline--player")
            .text()
            .trim();
          let tweet = `Pick ${pickCount}\nThe ${teamName} select ${playerName}`;
  
          if (!this.haveTweetedArray[pickCount - 1] && playerName) {
            this.Tweeter.sendTweet(tweet);
            console.log(tweet);
            this.haveTweetedArray[pickCount - 1] = true;
          }
  
          pickCount++;
        }
  
        if (this.haveTweetedArray.length != 60) {
            //wait 5 seconds then run again
          setTimeout(() => {
            this.run();
          }, 5000);
        } else {
          this.Tweeter.sendTweet("beep boop\nThat's all folks!");
        }
      });
    }
  
    public getNameFromAbb(pAbbr) {
      let ab = pAbbr.toLowerCase();
      let teams = this.teams;
  
      for (let team of teams) {
        if (team.abbreviation == ab) {
          return team.displayName;
        }
      }
      console.log("didnt find the team " + ab);
    }
  }
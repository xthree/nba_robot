var jsdom = require("jsdom");
var JSDOM = jsdom.JSDOM;
window = new JSDOM();
document = (new JSDOM('')).window;
global.document = document;
//@ts-ignore
$ = jQuery = require('jquery')(new jsdom.JSDOM().window);
var rp = require('request-promise');
//let jsonFile = require('jsonfile');
var fs = require('fs');
// TWITTER
var OAuth = require('oauth');
// Scheduleer
var schedule = require('node-schedule');
var BasketballGame = /** @class */ (function () {
    function BasketballGame(gameId) {
        var _this = this;
        this.hasGameStarted = false;
        this.isConcluded = false;
        this.gameConcludedInOvertime = false;
        this.haveDisplayedEndOfQuarter = false;
        this.haveDisplayedStartOfGame = false;
        this.haveDisplayedEndOfGame = false;
        this.outputLog = "";
        this.URL = "https://www.espn.com/nba/boxscore?gameId=" + gameId;
        this.fetchPage().then(function (html) {
            //console.log(html)
            _this.setUpContainers(html);
            //this.setUpTeamContainers();
            _this.initializeTeams();
            _this.refresh().then(function () {
                // If bot is started after the game has concluded, the run will not happen, and thus no generation of post-game files
                if (_this.isConcluded) {
                    return;
                }
                _this.run();
            });
        });
    }
    BasketballGame.prototype.generateSaveFile = function () {
        console.log("generating");
        var ret = {
            GameURL: this.URL,
            Competitors: this.awayTeam.name + "-" + this.homeTeam.name,
            GameDescription: this.description,
            AiringNetwork: this.airingNetwork,
            AwayScore: this.getAwayTeamScore(),
            HomeScore: this.getHomeTeamScore(),
            AwayPlayers: this.awayTeam.players,
            HomePlayers: this.homeTeam.players
        };
        var json = JSON.stringify(ret);
        console.log(json);
        var date = new Date();
        var dateTimeFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit' });
        var _a = dateTimeFormat.formatToParts(date), month = _a[0].value, day = _a[2].value, year = _a[4].value;
        var dateText = day + "-" + month + "-" + year;
        var fileName = ret.Competitors + " " + dateText;
        fs.writeFile("/output/" + fileName + ".json", json, function (e) {
            console.log("error");
            console.log(e);
        });
        fs.writeFile("/output/" + fileName + " Log.txt", this.outputLog, function (e) {
            console.log("error");
            console.log(e);
        });
    };
    BasketballGame.prototype.refresh = function () {
        var _this = this;
        return this.fetchPage().then(function (html) {
            _this.setUpContainers(html);
            _this.setUpTeamContainers();
            _this.updateGameData();
        })["catch"](function (error) {
            //console.log(error);
        });
    };
    BasketballGame.prototype.run = function () {
        var _this = this;
        var updateTime = 5000;
        var intervalId = setInterval(function () {
            //console.log("refreshing")
            _this.refresh().then(function () {
                if (_this.isConcluded) {
                    _this.generateSaveFile();
                    clearInterval(intervalId);
                    return false;
                }
            });
        }, updateTime);
    };
    BasketballGame.prototype.fetchPage = function () {
        return rp(this.URL);
    };
    BasketballGame.prototype.updateGameData = function () {
        this.description = this.$headerWrapper.find('.game-details').text().trim();
        this.airingNetwork = this.$headerWrapper.find('.game-status .network').text().trim();
        this.hasGameStarted = this.$wrapper.text().trim() != "No Box Score Available";
        this.currentTime = this.$headerWrapper.find('.game-status .game-time').text().trim();
        this.isEndOfQuarter = this.currentTime.includes("End") || this.currentTime.includes("Half");
        this.isConcluded = this.currentTime.includes("Final");
        var homeTeamScore = this.getHomeTeamScore();
        var awayTeamScore = this.getAwayTeamScore();
        var combinedScore = homeTeamScore + awayTeamScore;
        this.homeTeam.updateTeamData(homeTeamScore, this.isConcluded);
        this.awayTeam.updateTeamData(awayTeamScore, this.isConcluded);
        if (this.hasGameStarted && !this.haveDisplayedStartOfGame) {
            this.sendTweet(this.awayTeam.name + " " + this.homeTeam.name + "\nGame has started");
            this.haveDisplayedStartOfGame = true;
        }
        if (this.isConcluded && !this.haveDisplayedEndOfGame) {
            var msg = "\n" + this.currentTime + "\n" + this.awayTeam.name + "-" + this.awayTeam.score + " " + this.homeTeam.name + "-" + this.homeTeam.score;
            this.sendTweet(msg);
            this.haveDisplayedEndOfGame = true;
        }
        // Block display 
        if ((this.isEndOfQuarter && !this.haveDisplayedEndOfQuarter) || (!this.hasGameStarted && !this.haveDisplayedEndOfQuarter)) {
            if (!this.hasGameStarted) {
                var msg_1 = "Game has not yet started";
                this.outputLog += msg_1;
                console.log(msg_1);
                this.haveDisplayedEndOfQuarter = true;
                return;
            }
            var msg = "\n" + this.currentTime + "\n" + this.awayTeam.name + "-" + this.awayTeam.score + " " + this.homeTeam.name + "-" + this.homeTeam.score;
            this.outputLog += msg;
            console.log(msg);
            this.sendTweet(msg);
            this.haveDisplayedEndOfQuarter = true;
            return;
        }
        else if ((this.isEndOfQuarter && this.haveDisplayedEndOfQuarter) || (!this.hasGameStarted && this.haveDisplayedEndOfQuarter)) {
            return; //Wait until game starts again
        }
        // 
        if ((this.lastTime != this.currentTime && combinedScore != this.lastScore) || this.isConcluded) {
            var msg = "\n" + this.currentTime + "  " + this.awayTeam.name + "-" + this.awayTeam.score + " " + this.homeTeam.name + "-" + this.homeTeam.score;
            console.log(msg);
            if (this.isConcluded) {
                //this.sendTweet(msg);
            }
            this.outputLog += msg;
            this.haveDisplayedEndOfQuarter = false;
            this.lastTime = this.currentTime;
            this.lastScore = combinedScore;
        }
    };
    BasketballGame.prototype.setUpContainers = function (pHtml) {
        this.$pageWrapper = $(pHtml);
        this.$wrapper = this.$pageWrapper.find('#gamepackage-box-score');
        this.$headerWrapper = this.$pageWrapper.find('#gamepackage-matchup-wrap');
    };
    BasketballGame.prototype.setUpTeamContainers = function () {
        this.homeTeam.updateContainer(this.$wrapper.find('.gamepackage-home-wrap'));
        this.awayTeam.updateContainer(this.$wrapper.find('.gamepackage-away-wrap'));
    };
    BasketballGame.prototype.initializeTeams = function () {
        // Home
        var $homeWrapper = this.$wrapper.find('.gamepackage-home-wrap');
        var $homeHeaderWrapper = this.$headerWrapper.find('.team.home');
        var homeTeamUID = $homeHeaderWrapper.find('.team-name').data("clubhouse-uid");
        var homeTeamLocation = $homeHeaderWrapper.find('.long-name').text().trim();
        var homeTeamName = $homeHeaderWrapper.find('.team-name .short-name').text().trim();
        var homeTeamNameAbbreviation = $homeHeaderWrapper.find('.team-name .abbrev').text().trim();
        this.homeTeam = new Team($homeWrapper, homeTeamUID, homeTeamLocation, homeTeamName, homeTeamNameAbbreviation, true);
        // Away
        var $awayWrapper = this.$wrapper.find('.gamepackage-away-wrap');
        var $awayHeaderWrapper = this.$headerWrapper.find('.team.away');
        var awayTeamUID = $awayHeaderWrapper.find('.team-name').data("clubhouse-uid");
        var awayTeamLocation = $awayHeaderWrapper.find('.team-name .long-name').text().trim();
        var awayTeamName = $awayHeaderWrapper.find('.team-name .short-name').text().trim();
        var awayTeamNameAbbreviation = $awayHeaderWrapper.find('.team-name .abbrev').text().trim();
        this.awayTeam = new Team($awayWrapper, awayTeamUID, awayTeamLocation, awayTeamName, awayTeamNameAbbreviation, false);
    };
    BasketballGame.prototype.getHomeTeamScore = function () {
        return parseInt(this.$headerWrapper.find('.team.home .score').text().trim());
    };
    BasketballGame.prototype.getAwayTeamScore = function () {
        return parseInt(this.$headerWrapper.find('.team.away .score').text().trim());
    };
    BasketballGame.prototype.sendTweet = function (pTweetMessage) {
        var twitter_application_consumer_key = '2SeL89M9cIrfk7MASkX8hP3CC'; // API Key
        var twitter_application_secret = '5iAgRIgMIu663XXuB0h0nFGfvxhmP0TmkagoFfxSgyF40EkBql'; // API Secret
        var twitter_user_access_token = '1302720585709961216-3nfc7WAxpZ306L4CZttRBvkd4rg3gq'; // Access Token
        var twitter_user_secret = 'gsWYCH4fA7vz4k7Da0A7mhqUlag1pbDy42TrktvkHUdYI'; // Access Token Secret
        var oauth = new OAuth.OAuth('https://api.twitter.com/oauth/request_token', 'https://api.twitter.com/oauth/access_token', twitter_application_consumer_key, twitter_application_secret, '1.0A', null, 'HMAC-SHA1');
        var status = pTweetMessage; // This is the tweet (ie status)
        var postBody = {
            'status': status
        };
        oauth.post('https://api.twitter.com/1.1/statuses/update.json', twitter_user_access_token, // oauth_token (user access token)
        twitter_user_secret, // oauth_secret (user secret)
        postBody, // post body
        '', // post content type ?
        function (err, data, res) {
            if (err) {
                console.log(err);
            }
            else {
                // console.log(data);
            }
        });
    };
    return BasketballGame;
}());
var Team = /** @class */ (function () {
    function Team(pWrapper, pUID, pLocation, pTeamName, pTeamNameAbbreviation, pIsHomeTeam) {
        this.$wrapper = $(pWrapper);
        this.isHomeTeam = pIsHomeTeam;
        this.UID = pUID;
        this.location = pLocation;
        this.name = pTeamName;
        this.nameAbbreviation = pTeamNameAbbreviation;
    }
    Team.prototype.updateTeamData = function (pScore, pGeneratePlayerData) {
        if (pGeneratePlayerData === void 0) { pGeneratePlayerData = false; }
        this.score = pScore;
        if (pGeneratePlayerData) {
            this.generatePlayerData();
        }
    };
    Team.prototype.updateContainer = function ($pNewWrapper) {
        this.$wrapper = $pNewWrapper;
    };
    Team.prototype.generatePlayerData = function () {
        var _this = this;
        var $players = this.$wrapper.find("tbody tr").not('.highlight');
        this.players = [];
        // Counts score for accuracy check
        var scoreCount = 0;
        $players.each(function (i, row) {
            _this.players.push(new Player($(row)));
            scoreCount += isNaN(_this.players[i].points) ? 0 : _this.players[i].points;
        });
        scoreCount == this.score ? "" : console.warn("scores do not match. Expected " + this.score + ". Got " + scoreCount);
    };
    return Team;
}());
var Player = /** @class */ (function () {
    function Player($pRow) {
        this.name = $pRow.find('.name a span').first().text().trim();
        this.minutes = parseInt($pRow.find('.min').text().trim());
        this.fieldGoals = $pRow.find('.fg').text().trim();
        this.threePoints = $pRow.find('.3pt').text().trim();
        this.freeThrows = $pRow.find('.ft').text().trim();
        this.offensiveRebounds = parseInt($pRow.find('.oreb').text().trim());
        this.defensiveRebounds = parseInt($pRow.find('.dreb').text().trim());
        this.totalRebounds = parseInt($pRow.find('.reb').text().trim());
        this.assists = parseInt($pRow.find('.ast').text().trim());
        this.steals = parseInt($pRow.find('.stl').text().trim());
        this.blocks = parseInt($pRow.find('.blk').text().trim());
        this.turnOvers = parseInt($pRow.find('.to').text().trim());
        this.personalFouls = parseInt($pRow.find('.pf').text().trim());
        this.plusMinus = parseInt($pRow.find('.plusminus').text().trim());
        this.points = parseInt($pRow.find('.pts').text().trim());
    }
    return Player;
}());
rp("http://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard").then(function (e) {
    var data = JSON.parse(e);
    for (var _i = 0, _a = data.events; _i < _a.length; _i++) {
        var event_1 = _a[_i];
        var gameStartTime = new Date(event_1.date);
        gameStartTime.setMinutes(gameStartTime.getMinutes() - 15);
        console.log(event_1.name + " scheduled for " + gameStartTime + ". " + event_1.id);
        scheduleGame(gameStartTime, event_1.id);
    }
});
function scheduleGame(pStartTime, pGameId) {
    schedule.scheduleJob(pStartTime, function (y) {
        new BasketballGame(pGameId);
    });
}

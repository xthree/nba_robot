var ESPNSS;
(function (ESPNSS) {
    const rp = require('request-promise');
    class BasketballGame {
        constructor(gameId, fs) {
            this.hasGameStarted = false;
            this.isConcluded = false;
            this.gameConcludedInOvertime = false;
            this.haveDisplayedEndOfQuarter = false;
            this.haveDisplayedStartOfGame = false;
            this.haveDisplayedEndOfGame = false;
            this.outputLog = "";
            this.URL = `https://www.espn.com/nba/boxscore?gameId=${gameId}`;
            this.twitterBot = new ESPNSS.Twitter();
            this.fetchPage().then((html) => {
                //console.log(html)
                this.setUpContainers(html);
                //this.setUpTeamContainers();
                this.initializeTeams();
                this.refresh().then(() => {
                    // If bot is started after the game has concluded, the run will not happen, and thus no generation of post-game files
                    if (this.isConcluded) {
                        return;
                    }
                    this.run();
                });
            });
        }
        generateSaveFile() {
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
            let json = JSON.stringify(ret);
            console.log(json);
            const date = new Date();
            const dateTimeFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit' });
            const [{ value: month }, , { value: day }, , { value: year }] = dateTimeFormat.formatToParts(date);
            var dateText = `${day}-${month}-${year}`;
            var fileName = `${ret.Competitors} ${dateText}`;
            this.fs.writeFile(`/output/${fileName}.json`, json, (e) => {
                console.log("error");
                console.log(e);
            });
            this.fs.writeFile(`/output/${fileName} Log.txt`, this.outputLog, (e) => {
                console.log("error");
                console.log(e);
            });
        }
        refresh() {
            return this.fetchPage().then((html) => {
                this.setUpContainers(html);
                this.setUpTeamContainers();
                this.updateGameData();
            }).catch((error) => {
                //console.log(error);
            });
        }
        run() {
            let updateTime = 5000;
            var intervalId = setInterval(() => {
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
        fetchPage() {
            return rp(this.URL);
        }
        updateGameData() {
            this.description = this.$headerWrapper.find('.game-details').text().trim();
            this.airingNetwork = this.$headerWrapper.find('.game-status .network').text().trim();
            this.hasGameStarted = this.$wrapper.text().trim() != "No Box Score Available";
            this.currentTime = this.$headerWrapper.find('.game-status .game-time').text().trim();
            this.isEndOfQuarter = this.currentTime.includes("End") || this.currentTime.includes("Half");
            this.isConcluded = this.currentTime.includes("Final");
            let homeTeamScore = this.getHomeTeamScore();
            let awayTeamScore = this.getAwayTeamScore();
            let combinedScore = homeTeamScore + awayTeamScore;
            this.homeTeam.updateTeamData(homeTeamScore, this.isConcluded);
            this.awayTeam.updateTeamData(awayTeamScore, this.isConcluded);
            if (this.hasGameStarted && !this.haveDisplayedStartOfGame) {
                this.twitterBot.sendTweet(`${this.awayTeam.name} ${this.homeTeam.name}\nGame has started`);
                this.haveDisplayedStartOfGame = true;
            }
            if (this.isConcluded && !this.haveDisplayedEndOfGame) {
                let msg = `\n${this.currentTime}\n${this.awayTeam.name}-${this.awayTeam.score} ${this.homeTeam.name}-${this.homeTeam.score}`;
                this.twitterBot.sendTweet(msg);
                this.haveDisplayedEndOfGame = true;
            }
            // Block display 
            if ((this.isEndOfQuarter && !this.haveDisplayedEndOfQuarter) || (!this.hasGameStarted && !this.haveDisplayedEndOfQuarter)) {
                if (!this.hasGameStarted) {
                    let msg = "Game has not yet started";
                    this.outputLog += msg;
                    console.log(msg);
                    this.haveDisplayedEndOfQuarter = true;
                    return;
                }
                let msg = `\n${this.currentTime}\n${this.awayTeam.name}-${this.awayTeam.score} ${this.homeTeam.name}-${this.homeTeam.score}`;
                this.outputLog += msg;
                console.log(msg);
                this.twitterBot.sendTweet(msg);
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
                    //this.sendTweet(msg);
                }
                this.outputLog += msg;
                this.haveDisplayedEndOfQuarter = false;
                this.lastTime = this.currentTime;
                this.lastScore = combinedScore;
            }
        }
        setUpContainers(pHtml) {
            this.$pageWrapper = $(pHtml);
            this.$wrapper = this.$pageWrapper.find('#gamepackage-box-score');
            this.$headerWrapper = this.$pageWrapper.find('#gamepackage-matchup-wrap');
        }
        setUpTeamContainers() {
            this.homeTeam.updateContainer(this.$wrapper.find('.gamepackage-home-wrap'));
            this.awayTeam.updateContainer(this.$wrapper.find('.gamepackage-away-wrap'));
        }
        initializeTeams() {
            // Home
            let $homeWrapper = this.$wrapper.find('.gamepackage-home-wrap');
            let $homeHeaderWrapper = this.$headerWrapper.find('.team.home');
            let homeTeamUID = $homeHeaderWrapper.find('.team-name').data("clubhouse-uid");
            let homeTeamLocation = $homeHeaderWrapper.find('.long-name').text().trim();
            let homeTeamName = $homeHeaderWrapper.find('.team-name .short-name').text().trim();
            let homeTeamNameAbbreviation = $homeHeaderWrapper.find('.team-name .abbrev').text().trim();
            this.homeTeam = new ESPNSS.Team($homeWrapper, homeTeamUID, homeTeamLocation, homeTeamName, homeTeamNameAbbreviation, true);
            // Away
            let $awayWrapper = this.$wrapper.find('.gamepackage-away-wrap');
            let $awayHeaderWrapper = this.$headerWrapper.find('.team.away');
            let awayTeamUID = $awayHeaderWrapper.find('.team-name').data("clubhouse-uid");
            let awayTeamLocation = $awayHeaderWrapper.find('.team-name .long-name').text().trim();
            let awayTeamName = $awayHeaderWrapper.find('.team-name .short-name').text().trim();
            let awayTeamNameAbbreviation = $awayHeaderWrapper.find('.team-name .abbrev').text().trim();
            this.awayTeam = new ESPNSS.Team($awayWrapper, awayTeamUID, awayTeamLocation, awayTeamName, awayTeamNameAbbreviation, false);
        }
        getHomeTeamScore() {
            return parseInt(this.$headerWrapper.find('.team.home .score').text().trim());
        }
        getAwayTeamScore() {
            return parseInt(this.$headerWrapper.find('.team.away .score').text().trim());
        }
    }
    ESPNSS.BasketballGame = BasketballGame;
})(ESPNSS || (ESPNSS = {}));
//# sourceMappingURL=basketballGame.js.map
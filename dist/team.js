var ESPNSS;
(function (ESPNSS) {
    class Team {
        constructor(pWrapper, pUID, pLocation, pTeamName, pTeamNameAbbreviation, pIsHomeTeam) {
            this.$wrapper = $(pWrapper);
            this.isHomeTeam = pIsHomeTeam;
            this.UID = pUID;
            this.location = pLocation;
            this.name = pTeamName;
            this.nameAbbreviation = pTeamNameAbbreviation;
        }
        updateTeamData(pScore, pGeneratePlayerData = false) {
            this.score = pScore;
            if (pGeneratePlayerData) {
                this.generatePlayerData();
            }
        }
        updateContainer($pNewWrapper) {
            this.$wrapper = $pNewWrapper;
        }
        generatePlayerData() {
            let $players = this.$wrapper.find("tbody tr").not('.highlight');
            this.players = [];
            // Counts score for accuracy check
            let scoreCount = 0;
            $players.each((i, row) => {
                this.players.push(new ESPNSS.Player($(row)));
                scoreCount += isNaN(this.players[i].points) ? 0 : this.players[i].points;
            });
            scoreCount == this.score ? "" : console.warn(`scores do not match. Expected ${this.score}. Got ${scoreCount}`);
        }
    }
    ESPNSS.Team = Team;
})(ESPNSS || (ESPNSS = {}));
//# sourceMappingURL=team.js.map
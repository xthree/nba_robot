var ESPNSS;
(function (ESPNSS) {
    class Player {
        constructor($pRow) {
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
    }
    ESPNSS.Player = Player;
})(ESPNSS || (ESPNSS = {}));
//# sourceMappingURL=player.js.map
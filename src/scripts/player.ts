namespace ESPNSS {
    export class Player {
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
  
  
    constructor($pRow: JQuery) {
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
}
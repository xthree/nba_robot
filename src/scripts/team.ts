import { Player } from "./player"

let jsdom = require("jsdom");
let $ = require('jquery')(new jsdom.JSDOM().window);

export class Team {
    private $wrapper: JQuery;
    private isHomeTeam: boolean;
    readonly UID: string;
    private location: string;
    public name: string;
    private nameAbbreviation: string;
    public score: number;
    private record: string;
    public players: Player[];
    public areScoresAccurate: boolean;

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

    // Returns false if team score does not match added up player scores
    public generatePlayerData() {
        let $players = this.$wrapper.find("tbody tr").not('.highlight');
        this.players = [];

        // Counts score for accuracy check
        let scoreCount = 0;

        $players.each((i, row) => {
            this.players.push(new Player($(row)));
            scoreCount += isNaN(this.players[i].points) ? 0 : this.players[i].points;
        });

        this.areScoresAccurate = scoreCount == this.score;
        this.areScoresAccurate ? "" : console.warn(`scores do not match. Expected ${this.score}. Got ${scoreCount}`)
    }
}

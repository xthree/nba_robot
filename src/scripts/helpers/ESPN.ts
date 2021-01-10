export class ESPN {
    public static readonly schedule = `https://www.espn.com/nba/schedule/_/date/`; // ADD DATE YYYYMMDD
    public static readonly boxScore = `https://www.espn.com/nba/boxscore?gameId=`; //ADD GAMEID
    public static readonly gameCast = `https://www.espn.com/nba/game?gameId=`; //ADD GAMEID
    
    public static readonly hiddenAPI = `http://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard`; // Add nothing, see 
}

// {
//     leagues: [
//       {
//         id: '46',
//         uid: 's:40~l:46',
//         name: 'National Basketball Association',
//         abbreviation: 'NBA',
//         slug: 'nba',
//         season: [Object],
//         calendarType: 'day',
//         calendarIsWhitelist: true,
//         calendarStartDate: '2020-12-02T08:00Z',
//         calendarEndDate: '2021-07-23T06:59Z',
//         calendar: [Array]
//       }
//     ],
//     season: { type: 2, year: 2021 },
//     day: { date: '2021-01-07' },
//     events: [
//       {
//         id: '401267278',
//         uid: 's:40~l:46~e:401267278',
//         date: '2021-01-08T00:30Z',
//         name: 'Philadelphia 76ers at Brooklyn Nets',
//         shortName: 'PHI @ BKN',
//         season: [Object],
//         competitions: [Array],
//         links: [Array],
//         status: [Object]
//       },
//       {
//         id: '401267279',
//         uid: 's:40~l:46~e:401267279',
//         date: '2021-01-08T01:00Z',
//         name: 'Cleveland Cavaliers at Memphis Grizzlies',
//         shortName: 'CLE @ MEM',
//         season: [Object],
//         competitions: [Array],
//         links: [Array],
//         status: [Object]
//       },
//       {
//         id: '401267280',
//         uid: 's:40~l:46~e:401267280',
//         date: '2021-01-08T03:00Z',
//         name: 'Dallas Mavericks at Denver Nuggets',
//         shortName: 'DAL @ DEN',
//         season: [Object],
//         competitions: [Array],
//         links: [Array],
//         status: [Object]
//       },
//       {
//         id: '401267281',
//         uid: 's:40~l:46~e:401267281',
//         date: '2021-01-08T03:00Z',
//         name: 'San Antonio Spurs at Los Angeles Lakers',
//         shortName: 'SA @ LAL',
//         season: [Object],
//         competitions: [Array],
//         links: [Array],
//         status: [Object]
//       },
//       {
//         id: '401267282',
//         uid: 's:40~l:46~e:401267282',
//         date: '2021-01-08T03:00Z',
//         name: 'Minnesota Timberwolves at Portland Trail Blazers',
//         shortName: 'MIN @ POR',
//         season: [Object],
//         competitions: [Array],
//         links: [Array],
//         status: [Object]
//       }
//     ]
//   }
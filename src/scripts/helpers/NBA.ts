export class NBA {
  public static Teams: [];
}

export class NBATeam {
  public Location: string;
  public Mascot: string;
  public Id: string;
  public Abbreviation: string;
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

function getNameFromAbb(pAbbr){
    for(let team of teams){
        if(team.abbreviation == pAbbr){
            return team.displayName;
        }
    }
    console.log("didnt find the team")
}



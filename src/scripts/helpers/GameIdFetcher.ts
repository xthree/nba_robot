////////////////

//WORKS; NEEDS FINISHED

////////////////////

// import { ESPN } from "./ESPN";
// const rp = require("request-promise");



// //Global variables for between date call


// // MOMENT DATE FORMAT YYYYMMDD

// //getGameIdsBetweenDates(moment('20191022'), moment('20201011'));

// class GameIdFetcher {
//   private startMoment;
//   private endMoment;

//   private runningMoment;
//   private log = "";

//   private gameIds: string[] = [];

//     private JSONFILENAME = "EDIT_THIS.json";


//   constructor(pStartMoment, pEndMoment) {
//     this.startMoment = pStartMoment;
//     this.endMoment = pEndMoment;
//     this.runningMoment = pStartMoment;
//   }

//   private getGameIdsBetweenDates(pStartMoment, pEndMoment) {
//     this.runningMoment = pStartMoment;
  
//     let firstWeekURL = ESPN.schedule + runningMoment.format("YYYYMMDD");
  
//     getWeeksGameIds(firstWeekURL).then((e) => {
//       console.log("done done");
//       console.log(e);
//     });
//   }
// }



// // Recursive
// function getWeeksGameIds(pURL): Promise<any> {
//   return rp(pURL)
//     .then((html) => {
//       console.log("fetched page");
//       $(html);
//       let links = $(html)
//         .find("#sched-container .responsive-table-wrap table tbody tr")
//         .find("td.home")
//         .next()
//         .find("a")
//         .toArray();

//       for (let link of links) {
//         var href = $(link).attr("href");
//         // strip the game ids from the href url
//         gameIds.push(href.substring(href.lastIndexOf("=") + 1));
//       }
//       return;
//     })
//     .then(() => {
//       runningDate.add(7, "days");
//       log += `Running date: ${runningDate.toString()}`;
//       log += `End Date: ${endDate.toString()}`;

//       // If we
//       if (runningDate < endDate) {
//         console.log("Running again");
//         log += `Running Again\n`;

//         let scheduleWeekURL = ESPN.schedule + runningDate.format("YYYYMMDD");
//         return getWeeksGameIds(scheduleWeekURL);
//       } else {
//         log += "done\n";

//         Helpers.makeFile(gameIds, JSONFILENAME);
//         Helpers.makeFile(log, "Idog.txt");
//       }

//       return "DONE DONE MFERS";
//     });
// }

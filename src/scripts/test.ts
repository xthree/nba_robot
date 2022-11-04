import { Scheduler } from "./helpers/scheduler";

//Debug does not access Twitter's API
let skipTodaysGames = process.env.npm_config_skip == "true";

process.env.isDebug = "true";
console.log("App Starting in debug mode. Tweets will not be sent.");
Scheduler.dateRolloverCheck(skipTodaysGames);

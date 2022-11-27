import { Scheduler } from "./helpers/scheduler";

//Debug does not access Twitter's API
let skipTodaysGames = process.env.npm_config_skip == "true";

process.env.isDebug = "true";
console.log("App Starting in debug mode. Tweets will be sent on @nba_robot_beta without NBA hashtags ");
Scheduler.dateRolloverCheck(skipTodaysGames);

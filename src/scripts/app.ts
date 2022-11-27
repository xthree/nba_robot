import { Scheduler } from "./helpers/scheduler";

// Passed in as arguments to skip today's games. Type: `npm start -skip`
let skipTodaysGames = process.env.npm_config_skip == "true";
process.env.isDebug = "false";
console.log("App Starting in PRODUCTION mode. TWEETS WILL BE SENT.");

Scheduler.dateRolloverCheck(skipTodaysGames);

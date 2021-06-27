import { Scheduler } from "./helpers/scheduler";

// Passed in as arguments to skip today's games. Type: `npm start -skip`
let gamesForTodayAlreadyTweeted = process.env.npm_config_skip == 'true';

const isDebug = false;
console.log("App Starting in PRODUCTION mode. TWEETS WILL BE SENT.");

Scheduler.dateRolloverCheck(isDebug, gamesForTodayAlreadyTweeted);
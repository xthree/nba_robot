import { Scheduler } from "./helpers/scheduler";


// Passed in as arguments to skip scheduling today's game and set up for tomorrow instead
// npm start -skip
let gamesForTodayAlreadyTweeted = process.env.npm_config_skip == 'true';

// Start the bot
Scheduler.dateRolloverCheck(false, gamesForTodayAlreadyTweeted);
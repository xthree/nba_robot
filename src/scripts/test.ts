import { Scheduler } from "./helpers/scheduler";

//Debug does not access Twitter's API
const isDebug = true;
console.log("App Starting in debug mode. Tweets will not be sent.");

Scheduler.dateRolloverCheck(isDebug);
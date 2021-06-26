import { Scheduler } from "./helpers/scheduler";

//Add any tests here
//Debug does not access Twitter's API
const isDebug = true;
Scheduler.dateRolloverCheck(isDebug);
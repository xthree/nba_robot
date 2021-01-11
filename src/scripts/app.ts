import { BasketballGame } from "./basketballGame";
import { Scheduler } from "./helpers/scheduler";
import { Helpers } from "./helpers/helpers";

const moment = require("moment");

let jsdom = require("jsdom");
let $ = require("jquery")(new jsdom.JSDOM().window);
const rp = require("request-promise");
const fs = require("fs");

const scheduler = require('node-schedule');

// Schedule all games for the day
Scheduler.scheduleAllGames();
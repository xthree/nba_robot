var ESPNSS;
(function (ESPNSS) {
    var jsdom = require("jsdom");
    const { JSDOM } = jsdom;
    window = new JSDOM();
    document = (new JSDOM('')).window;
    global.document = document;
    //@ts-ignore
    $ = jQuery = require('jquery')(new jsdom.JSDOM().window);
    const rp = require('request-promise');
    //let jsonFile = require('jsonfile');
    const fs = require('fs');
    // Scheduler
    // const scheduler = require('node-schedule');
    // rp("http://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard").then((e) => {
    //   var data = JSON.parse(e);
    //   for (let event of data.events) {
    //     let gameStartTime = new Date(event.date);
    //     gameStartTime.setMinutes(gameStartTime.getMinutes() - 15);
    //     console.log(`${event.name} scheduled for ${gameStartTime}. ${event.id}`);
    //     scheduleGame(gameStartTime, event.id);
    //   }
    // });
    // function scheduleGame(pStartTime, pGameId) {
    //   scheduler.scheduleJob(pStartTime, function (y) {
    //     new BasketballGame(pGameId, fs);
    //   });
    // }
    new ESPNSS.BasketballGame("401248438", fs);
})(ESPNSS || (ESPNSS = {}));
//# sourceMappingURL=main.js.map
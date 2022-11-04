import keys from "./config/keys";

// TWITTER
const OAuth = require("oauth");

export class Twitter {
  private oauth;
  private appMode;
  private isDebug: boolean;

  constructor() {
    this.isDebug = process.env.isDebug === "true";
    this.appMode = this.isDebug ? "test" : "production";
    console.log(this.appMode);
    this.oauth = new OAuth.OAuth(
      "https://api.twitter.com/oauth/request_token",
      "https://api.twitter.com/oauth/access_token",
      keys[this.appMode].twitter_application_consumer_key,
      keys[this.appMode].twitter_application_secret,
      "1.0A",
      null,
      "HMAC-SHA1"
    );
  }

  public sendTweet(pTweetMessage: string, pReplyToId: string = null): Promise<any> {
    return new Promise((resolve, reject) => {
      pTweetMessage += "\n";
      // if (this.isDebug) {
      //   console.log("Fake Tweeting:");
      //   console.log(pTweetMessage);
      //   return;
      // }

      console.log(`Tweeting:\n ${pTweetMessage}`);

      let postBody = {
        status: pTweetMessage,
        in_reply_to_status_id: pReplyToId,
      };

      this.oauth.post(
        "https://api.twitter.com/1.1/statuses/update.json",
        keys[this.appMode].twitter_user_access_token, // oauth_token (user access token)
        keys[this.appMode].twitter_user_secret, // oauth_secret (user secret)
        postBody, // post body
        "", // post content type ?
        (err, data, res) => {
          if (err) {
            console.log("Errors detected");
            console.log(err);

            let errors = JSON.parse(err.data).errors;
            console.log(errors);

            for (let error of errors) {
              console.log("Error" + error.code + " " + error.message);
              console.log();
            }

            resolve("shit broke");
          }

          if (data) {
            let parsedData = JSON.parse(data);
            // Resolve with the tweet's id
            resolve(parsedData["id_str"]);
          }
        }
      );
    });
  }
}

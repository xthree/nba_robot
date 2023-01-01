import keys from "./config/keys";

// TWITTER
const OAuth = require("oauth");

type AppMode = "test" | "production";

type Tweet = {
  id: string;
  created_at: string;
  text: string;
};

export class Twitter {
  private oauth;
  private appMode: AppMode;
  private isDebug: boolean;
  private disableRetry: boolean;

  constructor(appMode?: AppMode) {
    this.isDebug = process.env.isDebug === "true";
    this.appMode = appMode || this.isDebug ? "test" : "production";
    this.disableRetry = false;
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

  public getLatestTweetFromAccount(accountHandle: string): Promise<Tweet> {
    console.log("getting latest from ", accountHandle);
    return new Promise((resolve, reject) => {
      console.log("before get");
      this.oauth.get(
        `https://api.twitter.com/2/tweets/search/recent?query=from%3A${accountHandle}&tweet.fields=created_at`,
        keys[this.appMode].twitter_user_access_token, // oauth_token (user access token)
        keys[this.appMode].twitter_user_secret, // oauth_secret (user secret)
        (e, data) => {
          console.log("after get");
          if (data) {
            console.log("tehres data");
            let tweets = JSON.parse(data).data;
            resolve(tweets?.[0] as Tweet);
          }

          if (e) {
            console.log("get latest error");
            console.log(e);
          }
        }
      );
    });
  }

  public getTweet(tweetId: string) {
    return new Promise((resolve, reject) => {
      this.oauth.get(
        `https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=created_at`,
        keys[this.appMode].twitter_user_access_token, // oauth_token (user access token)
        keys[this.appMode].twitter_user_secret, // oauth_secret (user secret)
        (e, data) => {
          if (data) {
            let parsedData = JSON.parse(data);

            console.log(parsedData);
            // Resolve with the tweet's id
            //resolve(parsedData["id_str"]);
          }
        }
      );
    });
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

      if (pReplyToId) {
        console.log("In reply to: " + pReplyToId);
      }

      let postBody = {
        status: pTweetMessage,
        in_reply_to_status_id: pReplyToId,
      };

      console.log(postBody);

      this.oauth.post(
        "https://api.twitter.com/1.1/statuses/update.json",
        keys[this.appMode].twitter_user_access_token, // oauth_token (user access token)
        keys[this.appMode].twitter_user_secret, // oauth_secret (user secret)
        postBody, // post body
        "", // post content type ?
        async (err, data, res) => {
          if (err) {
            console.log("Errors detected");
            console.log(err);

            let errors = JSON.parse(err.data).errors;
            console.log(errors);

            for (let error of errors) {
              console.log("Error" + error.code + " " + error.message);
              console.log();
              if (error.code === 187 && !this.disableRetry) {
                // "Status is a duplicate error" Add a space to the end and tweet again. Created to allow the bot to start over when stopping and starting again
                await this.sendTweet(pTweetMessage + " ", pReplyToId);
              }
            }
            console.log("SHIT broke");
            reject("shit broke");
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

  public buildTwitterURL(tweetId: string) {
    const botHandle = keys[this.appMode].twitter_handle;
    return `https://twitter.com/${botHandle}/status/${tweetId}`;
  }
}

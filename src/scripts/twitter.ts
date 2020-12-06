// TWITTER
const OAuth = require('oauth');

export class Twitter {
    private oauth;
    private twitter_application_consumer_key: string;
    private twitter_application_secret: string;
    private twitter_user_access_token: string;
    private twitter_user_secret: string;
    private isDebug;

    constructor(pIsDebug) {
        this.isDebug = pIsDebug;
        this.twitter_application_consumer_key = '2SeL89M9cIrfk7MASkX8hP3CC';  // API Key
        this.twitter_application_secret = '5iAgRIgMIu663XXuB0h0nFGfvxhmP0TmkagoFfxSgyF40EkBql';  // API Secret
        this.twitter_user_access_token = '1302720585709961216-3nfc7WAxpZ306L4CZttRBvkd4rg3gq';  // Access Token
        this.twitter_user_secret = 'gsWYCH4fA7vz4k7Da0A7mhqUlag1pbDy42TrktvkHUdYI';  // Access Token Secret

        this.oauth = new OAuth.OAuth(
            'https://api.twitter.com/oauth/request_token',
            'https://api.twitter.com/oauth/access_token',
            this.twitter_application_consumer_key,
            this.twitter_application_secret,
            '1.0A',
            null,
            'HMAC-SHA1'
        );
    }

    public sendTweet(pTweetMessage: string) {
        
        if(this.isDebug){
            console.log("Fake Tweeting")
            //console.log(pTweetMessage);
            return;
        }

        var status = pTweetMessage;  // This is the tweet (ie status)

        var postBody = {
            'status': status
        };

        this.oauth.post('https://api.twitter.com/1.1/statuses/update.json',
            this.twitter_user_access_token,  // oauth_token (user access token)
            this.twitter_user_secret,  // oauth_secret (user secret)
            postBody,  // post body
            '',  // post content type ?
            function (err, data, res) {
                if (err) {
                    console.log(err);
                } else {
                    // console.log(data);
                }
            });
    }
}

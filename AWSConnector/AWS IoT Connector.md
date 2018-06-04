# AWS IoT Hub integration with Salesforce IOT Explorer

## 0. Prerequisite

The end-to-end connection described in this document expects that the following objects have been created in Salesforce:

* Platform Events to send data to from AWS
* Context definitions that merge the platform events with assets
* Assets exist with the key that can match the id sent in the event from AWS
* Orchestrations based on the context objects

Here are the examples I created for the purpose of this document.


## **1. Create Connected Application **

A connected app is necessary to make public facing Salesforce REST API calls from a client. The Connected App will be configured with oAuth 2.0 enabled so the Lambda can use the oAuth 2.0 Web Server flow to retrieve access_tokens.

### **Connected App configuration**

The Connected App is a simple Connected App (Salesforce → Setup → Apps → new Connected App) that has oAuth enabled and the two following Scopes:

* Full access (full)
* Perform requests on your behalf at any time (refresh_token, offline_access)
* Callback URL is [https://login.salesforce.com](https://login.salesforce.com/)


### **oAuth sequence and configuration in Client**

The lambda function will use an oAuth 2.0 Web Server flow to retrieve a token and will use the refresh token to maintain a valid access token.

The configuration is performed in two steps

* use a command line tool to retrieve the oAuth information (access_token, refresh_token and more)

Parameters needed are: “client Id”, “client secret”, “redirect URL” from the connected app, URL of the authorization server

* configure the outbound connections from  Lambda function to Salesforce, referencing the previously created http connector

## **2. Retrieve Access Token and Refresh Token**

Use Terminal to execute the following commands. [your_client_id] is called “Consumer Key” in Salesforce,  [your_redirect_url] is the Callback URL.

* **Request the authorization code using cURL**


`curl -X POST -H 'Content-Type: application/x-www-form-urlencoded' -d "response_type=code&client_id=**[your_client_id]**&redirect_uri=**[your_redirect_url]**``" "https://login.salesforce.com/services/oauth2/authorize" -v`* *

**Issued response:**

```
*   Trying 136.147.43.172…
***
< Location: https://login.salesforce.com/setup/secur/RemoteAccessAuthorizationPage.apexp?source=[a_bunch_of_random_code]
***
* Connection #0 to host login.salesforce.com left intact
```

* **Disregard the larger blob and copy the location url that is sent back from the request. **
* **Open url in a browser of your choice**
* **Complete Authentication with your Salesforce org**
* **Click ‘Allow’ in the following Access screen**
* **On next screen Copy the Url from the address bar**


* **The ‘code’ at the end of the url will now be used**
* **POST with 'code' to retrieve access_token and refresh_token **

`curl -X POST -H 'Content-Type: application/x-www-form-urlencoded' -d "grant_type=authorization_code&client_id=3MVG9g9rbsTkKnAVW9abdhxa6TlhTUEKDQNrGqpyPu4gvBRCaOeaHYAmyZM8cAtGS5.lVhfpeikoIpXtzVMWw&client_secret=2750853922881756995&code=aPrxbOND3gL_2LZSI8tsDikv9mz7zf5aXLgeV6syCcBNfZ_.plSbe_8FwtlRdcUCYsYURcZeaA%3D%3D&redirect_uri=https://login.salesforce.com" https://login.salesforce.com/services/oauth2/token`

**Issued response:**

```
{ "access_token": **[your_access_token]**,
"refresh_token": **[your_refresh_token]**,
"scope": "refresh_token full",
"id_token": **[your_id_token]**,
"instance_url": **[your_id_token]**,
"id": **[your_id],
**"token_type": "Bearer",
"issued_at": "1487839634788"}
```



## **3. Configure Lambda Function**

Some things to Note:

* This package uses [JSforce](https://jsforce.github.io/). So the package module is included in the zip file. The package wraps all Salesforce REST API and packages functionality like retrying on stale Salesforce access token.
* The function can not be implemented inline with AWS Lambda due to the jsforce package dependency. Install JSForce locally using
* npm install jsforce
* Implement the code snippet below using jsforce as required package. The event handler has to map the exact fields from the AWS IoT Event to the Salesforce Platform Event.
* This code snippet does not batch, retry or handle errors. The following functionalities should be developed on top of this code snippet.
    * Timeout: Add an overall timeout for when the connector should throw an error.
        * Most of the times I find that the default timeout for Lambda functions (3 sec) is too short. That is true especially when a new access token has to be requested for the session. When I increase the timeout to 10 sec in the AWS function console, this work really well.
    * Retry Mechanism: https://github.com/jsforce/jsforce/issues/41
        * Retry Interval: Possible add a retry interval in between each one of the above retries.
    * Error Handling: Throw an error using these instructions http://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-mode-exceptions.html on the callback of the jsforce request.
* The tokens are stored as encrypted environment variables and the process to retrieve them is described above. To actually encrypt the variables follow these instructions. http://docs.aws.amazon.com/lambda/latest/dg/tutorial-env_console.html
* To deploy this onto AWS Lambda, zip the full directory (including all node_modules) so AWS can satisfy the dependencies. Upload the zip file in AWS.
* zip -r maytronics.zip *




```
var jsforce = require('jsforce');
var conn = new jsforce.Connection({
  oauth2 : {
    clientId : process.env.clientId,
    clientSecret : process.env.clientSecret,
    redirectUri : process.env.redirectUri,
  },
  instanceUrl : process.env.instanceUrl,
  accessToken : process.env.accessToken,
  refreshToken : process.env.refreshToken
});

conn.oauth2.refreshToken(conn.refreshToken, (err, results) => {
  if (err) return reject(err);
  console.log('OAUTH2' + JSON.stringify(results));
});

exports.handler = function(event, context) {
    conn.sobject("Dolphin__e").create(
      { ID__c : event.ID,
       cleaningCycles__c : event.cleaningCycles,
       state__c : event.state
      }
    ,
    function(err, rets) {
      if (err) { return console.error(err); }
      console.log('SUCCESS' + JSON.stringify(rets));
    });
};
```

### Configure the lambda function with the required auth values


### Test the function with a test event


The log output should finally show that the event was successfully sent to Salesforce


## **4. Create a device in AWS IoT Hub**

In AWS IoT Hub, create a simple device and make note of the topic name encoded in the Thing ARN (here thing/MaytronicsDolphin)

### Create an action in AWS IoT Hub to invoke the Lambda function

Define an action in AWS IoT Hub to call the Lambda function for any event that is available for your thing. The topic name should be as before: thing/MaytronicsDolphin

## 5. Test the end-to-end scenario

Lastly you can test the end-to-end connection by sending an event to the thing in AWS IoT Hub.

Make sure to specify an ID for an asset that can be found in Salesforce. If unsure about an ID to use, create an asset in Salesforce and pick up the Salesforce object ID directly from the URL, for example:

```
https://myiot.lightning.force.com/one/one.app#/sObject/**02i0O00000TZ5T3QAL**/view
```

```
{
  "cleaningCycle": 1,
  "ID": "**02i0O00000TZ5T3QAL**",
  "state": "cleaning"
}
```

Publish the event to the topic in AWS IoT Hub and watch the orchestration in Salesforce IoT Explorer trigger state changes.

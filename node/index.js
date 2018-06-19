'use strict'
var jwtflow = require('new-salesforce-jwt');
var jsforce = require('jsforce');

//Create SF Connection
var consumerKey = process.env.consumerKey; // This is the connected app consumerKey
var apiUser = process.env.awsApiUser; // This is the api user used by aws to connect to sfdc
var privateKey = reBuildPrivateKey(); //This is the private Key linked to the public SSL cert
var sandbox = (process.env.isSandbox == 'true');  //Set to true, if publishing PE to a sandbox org
var instanceUrl = process.env.instanceUrl;
var platformEventAPIName = process.env.platformEventAPIName; //Set to PE API name (e.g 'Robot_State__e')

var sfConnection = null;

//Get AccessToken using JWT OAuth2 flow
jwtflow.getToken(consumerKey, privateKey, awsApiUser, sandbox, function(err, accessToken) {
    if (err) {
        console.log(err,null); // Error in JWT Flow
    }
    //With the OAuth access token, connect to Salesforce
    if (accessToken)  {
        var sfConnection = new jsforce.Connection();
        sfConnection.initialize({
        instanceUrl: instanceUrl,
        accessToken: accessToken
        });
    }
});
    
    
function reBuildPrivateKey() {
  var beginPk = "-----BEGIN PRIVATE KEY-----\n";
  var endPk   = "\n-----END PRIVATE KEY-----\n";
  return( beginPk + process.env.privateKey.split(' ').concat().join('\n') + endPk);
}

//base PE creator
function sendPlatformEvent(event, context, callback) {
    if (sfConnection) {
        //Publish a Platform Event
        sfConnection.sobject(platformEventAPIName).create(event).then (
            function (result) { callback(null,result);},
            function (err) { callback(err,null);}
        );
        }
}

function basicLog(err,result) {
    if(err) {console.log(err);}
    if(result) {console.log(result);}
}

//For Azure
module.exports = function (context, eventHubMessages) {
    sendPlatformEvent(eventHubMessages[0],context,basicLog)
}

//For AWS
module.exports.handler = sendPlatformEvent;
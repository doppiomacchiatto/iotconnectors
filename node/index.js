'use strict'
var jwtflow = require('new-salesforce-jwt');
var jsforce = require('jsforce');
var config = require('./config.js');

//Create SF Connection
var consumerKey = (config.consumer_key || process.env.consumerKey); // This is the connected app consumerKey
var apiUser = (config.api_username || process.env.apiUser); // This is the api user used by aws to connect to sfdc
var privateKey = reBuildPrivateKey(); //This is the private Key linked to the public SSL cert
var sandbox = (config.sandbox || process.env.isSandbox == 'true');  //Set to true, if publishing PE to a sandbox org
var instanceUrl = (config.instance_url || process.env.instanceUrl);
var platformEventAPIName = (config.platform_event || process.env.platformEventAPIName); //Set to PE API name (e.g 'Robot_State__e')

function reBuildPrivateKey() {
  var beginPk = "-----BEGIN PRIVATE KEY-----\n";
  var endPk   = "\n-----END PRIVATE KEY-----\n";
  var key = config.private_key || process.env.privateKey;
  return( beginPk + key.split(' ').concat().join('\n') + endPk);
}

//base PE creator
function sendPlatformEvent(event, context, callback) {
    if(!callback) {callback = basicLog;}
    console.log(event);
    console.log("Is Sandbox? "+sandbox);


    jwtflow.getToken(consumerKey, privateKey, apiUser, sandbox, function(err, accessToken) {
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
            if (sfConnection) {
                //Publish a Platform Event
                console.log("Sending Platform Event");
                sfConnection.sobject(platformEventAPIName).create(event).then (
                    function (result) { callback(null,result);},
                    function (err) { callback(err,null);}
                );
                }       
        }
    });


    
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
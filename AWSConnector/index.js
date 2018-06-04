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

//thanks wade
/*
cert = cert.replace("-----BEGIN CERTIFICATE-----\n","");
cert = cert.replace("\n-----END CERTIFICATE-----\n","");
cert = cert.replace("\n"," ");
*/

let jsforce = require('jsforce');

let conn = new jsforce.Connection({
    // you can change loginUrl to connect to sandbox or prerelease env.
    loginUrl : 'https://'+process.argv[2]+'.salesforce.com'
});

let fs = require('fs');

let username = process.argv[3];
let password = process.argv[4];
let fullName = 'IOT_CONNECTOR'; // no spaces
let cert = fs.readFileSync(process.argv[6],'utf8');

function makeid() {
    var id = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < 10; i++)
        id += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return id;
  }

conn.login(username, password, function (err, userInfo) {
    if (err) {
        return console.error(err);
    }

    let metadata = [{
        contactEmail: process.argv[5],
        description: 'Integration between Salesforce IoT and other clouds',
        fullName: fullName, 
        label: 'IOT Connector',
        oauthConfig: {
            callbackUrl: 'https://login.salesforce.com',
            certificate: cert,
            consumerSecret: makeid(), // at least 8 characters
                                        // unique (and only alphanumeric)
                                        // random number should be ok
            scopes: [
                'Basic',
                'Api',
                'Web',
                'Full',
                'RefreshToken'
            ]
        }
    }];

    conn.metadata.create('ConnectedApp', metadata, function (err, results) {
        if (err) {
            return console.error(err);
        }

        conn.metadata.read('ConnectedApp', fullName, function (err, metadata) {
            if (err) {
                return console.error(err);
            }

            console.log(metadata.oauthConfig.consumerKey);
        });
    });
});
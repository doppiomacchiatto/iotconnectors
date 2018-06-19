Salesforce Auth 2.0 JWT Bearer Token Flow Implementation
=============
salesforce-jwt is an minimal implementation of the [OAuth 2.0 JWT Bearer Token Flow](https://help.salesforce.com/HTViewHelpDoc?id=remoteaccess_oauth_jwt_flow.htm&language=en_US) that allows you to impersonate users on SalesForce.

Create key in osx terminal: 
 - openssl req -out CSR.csr -new -newkey rsa:2048 -nodes -keyout PrivateKey.key
 - openssl x509 -req -in CSR.csr -signkey privateKey.key -out CSR.crt

It is compatible with [jsforce](https://github.com/jsforce/jsforce).

## Installation

```bash
$ npm install salesforce-jwt
```

## Usage

```javascript

var jwtflow = require('salesforce-jwt');

var clientId = '3MVG9A2kN3Bn17hvVNDOE5FX8c9hS...30dgSSfyGi1FS09Zg'; // This is the connected app consumerKey
var privateKey = require('fs').readFileSync('./privateKey.key', 'utf8');
var sandbox = false;

jwtflow.getToken(clientId, privateKey, 'user@toImpersonate.com', sandbox, function(err, accessToken) {
	// err
	// accessToken will contain the token to use on SalesForce API.
});

```

This is an example on how to use it with [jsforce](https://github.com/jsforce/jsforce).

```javascript
var jsforce = require('jsforce');
var jwtflow = require('salesforce-jwt');

var clientId = '3MVG9A2kN3Bn17hvVNDOE5FX8c9hS...30dgSSfyGi1FS09Zg'; // This is the connected app consumerKey
var privateKey = require('fs').readFileSync('./privateKey.key', 'utf8');
var instanceUrl = 'https://na15.salesforce.com';
var sandbox = false;

jwtflow.getToken(clientId, privateKey, 'user@toImpersonate.com', sandbox, function(err, accessToken) {
	// err

	var sfConnection = new jsforce.Connection();

    sfConnection.initialize({
      instanceUrl: instanceUrl,
      accessToken: accessToken
    });

});
```

## License

MIT





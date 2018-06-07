# Publishing a Platform Event from AWS Lambda

# Before  you start

Make sure you have the following:

* Administrator access to a Salesforce org
* A Platform Event defined on this org
* An AWS account with access to the Lambda service
* A computer with node 6.10 and npm 3.10 installed


# The complete process

We are going to secure communications between AWS Lambda and Salesforce using OAuth 2.0 JSON Web Token (JWT)  Bearer flow. This will be done in 3 stages

![Image](./images/image_1.png)


# Stage 1 - Create a Private Key and SSL Certificate

JSON Web Token (JWT) is a JSON-based security token encoding mechanism that enables identity and security information to be shared across security domains.  In this scenario, the AWS Lambda service will use a private key to load Platform Events into Salesforce as a trusted user.  On the other side, Salesforce will use a Self-Signed X50 certificate, built from the AWS private key,  to verify and establish the trust between AWS Lambda and Salesforce

A simple way to create a private key and matching SSL certificate is to open a Terminal session (Mac/Unix) and run the following command

```
openssl req -nodes -new -x509 -keyout private.pem -out server.cert
```

You will be prompted to enter the following info

* Country Name (2-char)
* State or Province
* Locality Name
* Organization Name
* Organizational Unit Name (fully qualified name)
* Common Name
* Email


At this point you should have 2 new files

* **private.pem**  (Private Key) - This should look like this

```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDnhAdi9V5rdQSl
IK1h36muVfntj6GYsNPGM1vAoY8VUC9IFbfQaAL1eDiLbun+Hk9CEZ+gGraKKy28
hsewe/fuMtuuhxK52mLlUYEMZS6UJ3obJ+XwiF/M6NietpvLSIArOf3B/KQPH3wA
WOBEawE1b86jadx7KU+niva+sYjakFWGahJrrk/QGdiUKOdglnJZEC82yshqJ9GE
VVDjWAa7VpNLGhLv4N1VQrndVtBa/YOBt1x6SUmPffqKYHAzvhcxTxLYXQQzeZNi
4AkUxbegyoUgY/titrX3I2uCfUdOalzqVR/pyEw2F/iheCzUNRaZVCZ7WH80a04R
YCJxykHvAgMBAAECggEATI4M/z0RzsiwE4ZdrtqNulc1wMdY8Suvq396HJWPwcV1
DQoZcTGjoNXzJLA1cdFF9hvrw75xk/i5M/kBeStVDZAFso15tLkxMJEl8hpXL6hq
KSalU0dVHmX0k27gz3SW5TRU49uNyG5py5eX+SfFC42AL+smfBdp/oXmF6KPFW45
vCr6GzagUbp9hgm8xrqyoExeSSb0utrRivoa2hT1gJpv7V/t5paE4d4wxXkjTKT0
m59K7V9aHTt8QBvgu+a7qsFouTmhP7Yhi5qwHSOQ6FbS7zx2IX1rXyY8QwksTcdn
HRIAYEvgBEPj5PJfQriqUrZs4wVIqjSoBhNzdtgYgQKBgQD5dErP432qN8Y9Aa17
K8exA/N2PaYSX/IFqHUmsQQOPcRAWtPK+CisGFu1AQV7afDEIS2SAF4DldEH4nMX
3v/la3rQOq20BpYczTERHvQonmwcq4Xt/hPOo2sVkp5ZtQV5xRKltTVbrQuiEUp8
6sYlWCbREfjoXp5Fc/8RgoOCLwKBgQDtlzwRkJSXLc+SEXsYF5CXRC8n4Sj9IgTK
jNC0H4wrjTNvfiybsTbkrFJtX9hPYVdkHVvX9XfXsZ7xmPttks2UgA9/MoxgYPe4
MoWvdzvpJMuLmXurTGCxef+3iHFSqQCnsmN0PHxZcfRwQimAvcj+F0R34HJXFhhr
8RqwiXQMQQKBgEGnsv0OUgfYECwEYgWWG0Pi11Ram3ggmpGUqejaFEgvR5TskuvL
7uCEtLZqI2g9FOp6FQVlZVkqOE8L8eDph455gGSH3SoRxbak5vIrpHWAZNIS7vgZ
tFrhthCCe3z+4QcQsHy+ueF8JSCtzl4caLRxhB3ozgtSw/NhuVOBd11vAoGATAPf
DB+d6uCVUL6XC5Y+hKckDzZSzupbbhKvk3GkfyqmEj3kN8vzLCaWGLhZlMwoEbfy
8p1uwmvp1pKDnwMhEyoFy0R49T0RBLXlX8ZePLGxDfEFSEEfjqjhz+6vkyrPMtg4
SbAweM2kz2XbsX0HGYSIO3JsIsDG/4Icb+8KWgECgYEAvvK9Yd/Lk2EhWjiRB19f
rZB19eL/ECbNOjVy+soiewuX9S0cz259GuTfBa8+Ii/QF0wfB8J42Q7tHUTq9z9B
06cXbzRQneXws6ViHRqRiHY=
-----END PRIVATE KEY-----
```



* **server.crt** (SSL Certificate) - This should look like this

```
-----BEGIN CERTIFICATE-----
MIIC6DCCAdACCQDn2vN8XSQi5jANBgkqhkiG9w0BAQsFADA2MQswCQYDVQQGEwJV
SzEnMCUGCSqGSIb3DQEJARYYZXNhbmRvdmFsQHNhbGVzZm9yY2UuY29tMB4XDTE4
MDMyOTEzMDk0MVoXDTE4MDQyODEzMDk0MVowNjELMAkGA1UEBhMCVUsxJzAlBgkq
hkiG9w0BCQEWGGVzYW5kb3ZhbEBzYWxlc2ZvcmNlLmNvbTCCASIwDQYJKoZIhvcN
AQEBBQADggEPADCCAQoCggEBAOeEB2L1Xmt1BKUgrWHfqa5V+e2PoZiw08YzW8Ch
jxVQL0gVt9BoAvV4OItu6f4eT0IRn6AatoorLbyGx7B79+4y266HErnaYuVRgQxl
LpQnehsn5fCIX8zo2J62m8tIgCs5/cH8pA8ffABY4ERrATVvzqNp3HspT6eK9r6x
iNqQVYZqEmuuT9AZ2JQo52CWclkQLzbKyGon0YRVUONYBrtWk0saEu/g3VVCud1W
0Fr9g4G3XHpJSY99+opgcDO+FzFPEthdBDN5k2LgCRTFt6DKhSBj+2K2tfcja4J9
R05qXOpVH+nITDYX+KF4LNQ1FplUJntYfzRrThFgInHKQe8CAwEAATANBgkqhkiG
9w0BAQsFAAOCAQEATB1CV5rxY+uRgrJrCBb31VLaLK60/EA+VGksd0ch5xtE5vCe
6/jwnatuvhSL0oI8yoitqLbxgp/s20RWmofUBSxJFCElO9OV7GKz17wS9k/pgQfA
i4DIopxA86u9P+mdom4t8AG9nz/w1tJ20WWRMDAqfH5l9wZAsG8ZHVzvZ0NAn26L
mW+hZFcXbtLHm71Fo3iZ2sBqwq7rel2yBYKeZ46lswXvf30Oge1xovkJfjl9rpfy
/TU6nRhAe8GZEBMdMtE/SKHitnFyaSObQIYA8IvqeVzyXltE4xnKdWqdJRS3AKS7
TLoOylYqv+nKIcJrVLk/2COspYDV2cFpZyX9yw==
-----END CERTIFICATE-----
```


You will use the **private key** and **server certificate** in the next 2 stages

![Image](./images/image_2.png)

# Stage 2 - Set up Salesforce Security

As a Salesforce Administrator to the org, complete the following tasks:

1. Create a locked-down **AWS Lambda Integration User** Profile.
    1. This profile should only allow
        1. **Create** and **Read** permission to the relevant **Platform Event(s)**
        2. API Enabled = true
2. Create a AWS API User and assign it to the **AWS Lambda Integration User Profile**
    1. For this exercise, let's name it : **[awsapiuser@gadgets.com](mailto:awsapiuser@gadgets.com)**
3. Create a New Connected App. Use the following values as a guide
    1. Connected App name = **AWSLambdaApp**
    2. Contact Email = Your email
    3. Enable OAuth Settings = Checked
        1. Callback URL = https://www.salesforce.com/callback
    4. Use digital signatures = Checked
        1. Click on Choose file to upload the **server.crt **created in the previous section
    5. Available OAuth Scopes - Add the following
        1. Access and Manage your data (API)
        2. Perform Requests on your behalf at any time
    6. Require secret for Web Server Flow = Unchecked
4. Make a note of the **Consumer Key** as you will need it in your AWS Lambda Function
5. Go Back to App Manager and Choose **“Manage”**

![Image](./images/image_3.png)

* Click **“Edit Policies”**
    * Set Permitted Users = **“Admin Approved users are pre-authorized”**
* **Under Managed Profiles**
    * Add the **“AWS Lambda Integration User”** Profile

![Image](./images/image_4.png)

# Stage 3 - Create the AWS Lambda Function

Finally, you will create a Lambda function that uses the private key (created in section 1) to publish a Platform Event into your salesforce org. The AWS Lambda function will impersonate the AWS api user (created in section 2)

This stage consists of 2 sets of steps:

* Create and package the function source code and
* Create the AWS Lambda function

## Create and Package the function source code

Complete the following steps

* Create a new folder (name it **myfunction**)
* Open a Terminal and navigate to this folder
  * Run the following command

```
npm init
```

  * Accept all default entries by hitting **ENTER**
  * At this point you should have a **package.json** file under your **myfunction** folder
* Install the following npm packages

```
npm i new-salesforce-jwt --save
npm i jsforce --save
```

* Create index.js (under your **myfunction** folder)

```
touch index.js
```

* Edit index.js and paste the following Javascript code

```javascript
'use strict'
var jwtflow = require('new-salesforce-jwt');
var jsforce = require('jsforce');

function reBuildPrivateKey() {
  var beginPk = "-----BEGIN PRIVATE KEY-----\n";
  var endPk   = "\n-----END PRIVATE KEY-----\n";
  return( beginPk + process.env.privateKey.split(' ').concat().join('\n') + endPk);
}

exports.**handler** = function (event, context, callback) {
  var consumerKey = process.env.consumerKey; // This is the connected app consumerKey
  var awsApiUser = process.env.awsApiUser; // This is the api user used by aws to connect to sfdc
  var privateKey = reBuildPrivateKey(); //This is the private Key linked to the public SSL cert
  var sandbox = (process.env.isSandbox == 'true');  //Set to true, if publishing PE to a sandbox org
  var instanceUrl = process.env.instanceUrl;
  var platformEventAPIName = process.env.platformEventAPIName; //Set to PE API name (e.g 'Robot_State__e')

  //Get AccessToken using JWT OAuth2 flow
  jwtflow.getToken(consumerKey, privateKey, awsApiUser, sandbox, function(err, accessToken) {
    if (err) {
      callback(err,null); // Error in JWT Flow
    }
    //With the OAuth access token, connect to Salesforce
    if (accessToken)  {
      var sfConnection = new jsforce.Connection();
      sfConnection.initialize({
        instanceUrl: instanceUrl,
        accessToken: accessToken
      });
      if (sfConnection) {
        //Publish a Robot_State__e Platform Event
        sfConnection.sobject(platformEventAPIName).create(event).then (
          function (result) { callback(null,result);},
          function (err) { callback(err,null);}
        );
      }
    }
  });
}
```


* Create **myfunction.zip**  - A zip file containing, at its root, the myFunction folder and all of its contents

![Image](./images/image_5.png)

Now that you have the source code packaged in a zip file,  the final step is to create the AWS Lambda function


## Create the AWS Lambda Function

* Logon to the AWS Console and Access the Lambda Service

![Image](./images/image_6.png)

* Click on  **Create Function**
    * Select “Author From Scratch”
    * Enter Name = **myawsfunction**
    * Runtime = Node.js 6.10
    * Role → Create custom role
        * Select lambda_basic_execution
        * Click **Allow**
    * Click **Create Function**

Your new function is now created. The screen should look like this

![Image](./images/image_7.png)

* Scroll down and create the following Environment Variables

![Image](./images/image_8.png)

  * **consumerKey** = The consumer key from the Connected App  created at Stage 2
  * **awsApiUser** = The salesforce user name that AWS will impersonate ( e.g **awsapiuser@gadgets.com**
  * **instanceUrl** = You can get this from the browser URL when connected to your org (e.g. [https://eu12.salesforce.com](https://eu12.salesforce.com/))
  * **platformEventAPIName** = Robot_State__e (this Platform Event must exist in your org)
  * **isSandbox** = false (set to **false** for Developer Edition or Production orgs)
  * **privateKey** = Enter the contents of the Private key created in stage one, **EXCEPT THE 1ST AND LAST LINES!**


* Create a Test Event for your Lambda Function
    * Click **Configure Test event**

![Image](./images/image_9.png)

* Note the Test Event data fields must correspond to a Platform Event (in this case **Robot_State__e**) previosuly defined on Salesforce


* Upload the Packaged Source code (Zip file)
    * Under the Function Code section, choose
        * Upload a .Zip file (Choose your **myFunction.zip**)
        * Runtime = Node.js 6.10
        * Handler = myFunction/index.handler (This is the location of the handler function within the zip file)

![Image](./images/image_10.png)

* Click **Save**

## Test your AWS Lambda Function


Click **Test** and check that the output is similar to that shown on the screen below.

![Image](./images/image_11.png)


# References

* [Create a simple Lambda Function](https://docs.aws.amazon.com/lambda/latest/dg/get-started-create-function.html)
* [Lambda Environment Variable Encryption](https://docs.aws.amazon.com/lambda/latest/dg/env_variables.html#env_encrypt)
* [Create a Lambda function using Environment variables to store sensitive information](https://docs.aws.amazon.com/lambda/latest/dg/tutorial-env_console.html)
* [Digging deeper into OAuth 2.0 in Salesforce](https://help.salesforce.com/articleView?id=remoteaccess_authenticate_overview.htm)
* [OAuth 2.0 JWT Bearer Token Flow](https://help.salesforce.com/articleView?id=remoteaccess_oauth_jwt_flow.htm&type=5)
* NPM module new-salesforce-jwt: [Salesforce Auth 2.0 JWT Bearer Token Flow Implementation](https://www.npmjs.com/package/new-salesforce-jwt)
* NPM module jsforce: [Salesforce API Library for JavaScript applications (both on web browser and Node.js)](https://www.npmjs.com/package/jsforce)

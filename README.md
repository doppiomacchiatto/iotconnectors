# IoT Connector

This repo holds sample code for creating Platform Events via API that can be hosted on various cloud platforms (AWS, Azure, etc.).

## Quick Start

First, clone this repository:

``
git clone https://github.com/developerforce/iotconnectors.git
``

Then go into the sfdx directory and run the bash script

`
cd iotconnectors
cd sfdx
sh ./projectSetup.sh
`

Follow the instructions in the script which will require answering some prompts.  At the end of the script you will have:

1. A Connected App in a Dev Hub, Sandbox or Production instance.
2. A scratch org with a Platform Event, Context and Orchestration for a Smart Thermostat device
3. A certificate and private key for JWT authentication
4. A node application which can be deployed to Azure or AWS.

See the following for setting up in:

* [AWS IoT Hub](./AWSConnector) 
* [AWS Lambda](./AWSPlatformEvents) 
* [Azure IoT](./AzureConnector) 


## The manual route

If you want to create the working parts yourself, following these guides:

* [IoT Quick Start](https://trailhead.salesforce.com/en/projects/quick-start-iot-explorer) This Trailhead Quick Start walks through creating the platform event, context and orchestration.
* [Connected App and Certificate](./AWSPlatformEvents) 

Then go into the node directory and update config.json with the correct information.  You would then continue with the guide to setting up in the cloud of your choice:

* [AWS IoT Hub](./AWSConnector) 
* [AWS Lambda](./AWSPlatformEvents) 
* [Azure IoT](./AzureConnector) 



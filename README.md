# IoT Connector

This repo holds sample code for creating Platform Events via API that can be hosted on various cloud platforms (AWS, GCP, Azure, etc.).

All user documentation with detailed instructions on configuration, deployment and execution are available in this [Wiki](../../wiki).

The repository contains two submodules for two unmanaged applications that can be deployed into an Salesforce org (using SFDX 2nd generation package deployment):

**UDPATE: The two connector apps are currently under review and not available for deployment at this time. Please check back again later.**

1. An Amazon [AWS IoT Connector Application](https://github.com/hkache/AWS-iotconnector)

2. A Google [GCP IoT Connector Application](https://github.com/hkache/GCP-iotconnector)

For user documentations on these two applications see the [Wiki](../../wiki) pages for the [AWSIoTConnector](../../wiki/AWSIoTConnector) and [GCPIoTConnector](../../wiki/GCPIoTConnector) respectively.

## Quick Start

First, clone this repository:

``
git clone https://github.com/developerforce/iotconnectors.git
``

Then go into the sfdx directory and run the bash script

```
cd iotconnectors
cd sfdx
sh ./projectSetup.sh
```

Follow the instructions in the script which will require answering some prompts.  At the end of the script you will have:

1. A Connected App in a Dev Hub, Sandbox or Production instance.
2. A scratch org with a Platform Event, Context and Orchestration for a Smart Thermostat device
3. A certificate and private key for JWT authentication
4. A node application which can be deployed to Azure or AWS.

See the following for setting up in:

* [AWS IoT Hub](https://github.com/developerforce/iotconnectors/wiki/AWSPlatformEvents-WebFlow) 
* [AWS Lambda](https://github.com/developerforce/iotconnectors/wiki/AWSPlatformEvents-JWT) 
* [Azure IoT](https://github.com/developerforce/iotconnectors/wiki/AzurePlatformEvents) 


## The manual route

If you want to create the working parts yourself, following these guides:

* [IoT Quick Start](https://trailhead.salesforce.com/en/projects/quick-start-iot-explorer) This Trailhead Quick Start walks through creating the platform event, context and orchestration.
* [Connected App and Certificate](https://github.com/developerforce/iotconnectors/wiki/AWSPlatformEvents-JWT) 

Then go into the node directory and update config.json with the correct information.  You would then continue with the guide to setting up in the cloud of your choice:

* [AWS IoT Hub](https://github.com/developerforce/iotconnectors/wiki/AWSPlatformEvents-WebFlow) 
* [AWS Lambda](https://github.com/developerforce/iotconnectors/wiki/AWSPlatformEvents-JWT) 
* [Azure IoT](https://github.com/developerforce/iotconnectors/wiki/AzurePlatformEvents) 



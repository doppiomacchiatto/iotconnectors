#! /bin/bash
sfdx force:org:create -s -f config/project-scratch-def.json -a iotconnector

sfdx force:org:display > ./scratch.txt

node ../node/config readorgfile ./scratch.txt
echo "Config updated"
echo "Opening Scratch Org.  Enable IoT to allow source push."
sfdx force:org:open -p /lightning/setup/IoTGettingStarted/home

read -p 'Hit enter when IoT is enabled' enableiot 
echo "Pushing source"
sfdx force:source:push

echo "Please answer the following prompts to generate a secure key and certificate"
openssl req -nodes -new -x509 -keyout private.pem -out server.cert

node ../node/config readkeyfile ./private.pem
echo "Config updated"

echo "Please answer the following prompts to create a Connected App."
read -p 'Connected App Org Username: ' uservar
echo -n 'Connected App Org Password: '
read -s passvar
read -p 'Connected App Orgb Email: ' emailvar

echo "Creating Connected App"
node ../node/create_connected_app $uservar $passvar $emailvar ./server.cert > ./consumer_key.txt
node ../node/config readconsumerfile ./consumer_key.txt
node ../node/config platform_event Smart_Thermostat_Reading__e

more ./config.json




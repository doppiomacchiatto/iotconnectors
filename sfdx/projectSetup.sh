#! /bin/bash
read -p 'Enter your email address: ' emailvar

sfdx force:org:create -s -f config/project-scratch-def.json -a iotconnector
sfdx force:org:display > ./scratch.txt

node ../node/config sandbox true
node ../node/config readorgfile ./scratch.txt
echo "Config updated"

username="$(node ../node/config output api_username)"
sfdx force:user:password:generate --targetusername $username
sfdx force:user:display -u $username > ./scratch.txt
password="$(node ../node/config showpwdfile ./scratch.txt)"

echo "Generating test key and certificate"
openssl req -nodes -new -x509 -subj "/C=US/ST=IL/L=Chicago/O=Salesforce/CN=salesforce" -keyout private.pem -out server.cert
node ../node/config readkeyfile ./private.pem
echo "Config updated"

echo "Opening Scratch Org.  Enable IoT to allow source push."

sfdx force:org:open -p /lightning/setup/IoTGettingStarted/home

read -p 'Hit enter when IoT is enabled... ' goon 
echo "Pushing source"
sfdx force:source:push
node ../node/config platform_event Smart_Thermostat_Reading__e

echo "Creating Connected App"
node ../node/create_connected_app test $username $password $emailvar ./server.cert > ./consumer_key.txt
node ../node/config readconsumerfile ./consumer_key.txt

cp ./config.json ../node/config.json

echo "Opening Scratch Org."
echo "You will need to configure the Connected App."
echo "In App Manager, click 'Manage' on the drop down next to 'IOT Connect'"
echo "Click 'Edit Policies'"
echo "Set 'Permitted Users' to 'Admin approved users are pre-authorized'"
echo "Click 'Save'"
echo "Under Profiles, click 'Manage Profiles' and add 'System Administrator'"

sfdx force:org:open -p /lightning/setup/NavigationMenus/home

read -p 'Hit enter when Connected App is updated... ' goon 


echo "Creating zip file for node application"
cd ../node
npm install
zip -r connector.zip *

cd ../sfdx
echo "Finished."



#! /bin/bash
sfdx force:org:create -s -f config/project-scratch-def.json -a iotconnector

echo "Opening Scratch Org.  Enable IoT to allow source push."
sfdx force:org:open -p /lightning/setup/IoTGettingStarted/home

read -p 'Hit enter when IoT is enabled' enableiot 

sfdx force:source:push

echo "Please answer the following prompts to generate a secure key and certificate"
openssl req -nodes -new -x509 -keyout private.pem -out server.cert

echo "Please answer the following prompts to create a Connected App."
read -p 'Dev Hub / Sandbox Username: ' uservar
echo -n 'Dev Hub / Sandbox Password: '
read -s passvar
read -p 'Dev Hub / Sandbox Email: ' emailvar

echo "Creating Connected App"
node ../node/create_connected_app $uservar $passvar $emailvar



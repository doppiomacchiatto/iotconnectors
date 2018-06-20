var fs = require("fs");
var content = fs.readFileSync("./config.json");
var config = JSON.parse(content);

//as command line
if(process.argv) {
    if(process.argv[2] == "sandbox") {
        if(process.argv[3] == "true") {config.sandbox = true;}
        if(process.argv[3] == "false") {config.sandbox = false;}
    }

    if(process.argv[2] == "api_username") {
        config.api_username = process.argv[3];
    }

    if(process.argv[2] == "api_username") {
        config.api_username = process.argv[3];
    }

    if(process.argv[2] == "consumer_key") {
        config.consumer_key = process.argv[3];
    }

    if(process.argv[2] == "instance_url") {
        config.instance_url = process.argv[3];
    }

    if(process.argv[2] == "platform_event") {
        config.platform_event = process.argv[3];
    }

    if(process.argv[2] == "private_key") {
        config.private_key = process.argv[3];
    }

    if(process.argv[2] == "readorgfile") {
        var orgdisplay = fs.readFileSync(process.argv[3],'utf8');
        var orgdisplay_lines = orgdisplay.split("\n");
        config.instance_url = orgdisplay_lines[12].split("     ")[1];
        config.api_username = orgdisplay_lines[15].split("         ")[1];
    }

    if(process.argv[2] == "readkeyfile") {
        var privatekey = fs.readFileSync(process.argv[3],'utf8');
        privatekey = privatekey.replace("-----BEGIN PRIVATE KEY-----\n","");
        privatekey = privatekey.replace("\n-----END PRIVATE KEY-----\n","");
        privatekey = privatekey.replace("\n"," ");
        config.private_key = privatekey;
    }

    if(process.argv[2] == "readconsumerfile") {
        var consumer_key = fs.readFileSync(process.argv[3],'utf8');
        config.consumer_key = consumer_key;
    }

    fs.writeFileSync('config.json', JSON.stringify(config), 'utf8');

//    console.log(config);
} else {

//as module
module.exports = config;

}






var express = require("express");
var app = express();
const ksqldb = require("ksqlient");
const client = new ksqldb({ ksqldbURL: "http://192.168.1.201:8088" });

app.listen(3005, () => {
    console.log("Server running on port 3005");
});

app.get("/api/v1/whitelist", async (req, res, next) => {
    const response = await client.pull("SELECT * FROM WHITELISTED_THINGYS;");
    console.log(response);
    let whitelist = [];

    for(const [mac, whitelisted] of response.slice(1)) {
        if(whitelisted){
            whitelist.push(mac);
        }
    }

    res.json(whitelist);
});

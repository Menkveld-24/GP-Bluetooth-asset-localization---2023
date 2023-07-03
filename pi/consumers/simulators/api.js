/*
 * This is a simple API that returns the whitelist of MAC addresses, used by the consumers.
 */
var express = require("express");
var app = express();
const ksqldb = require("ksqlient");
const client = new ksqldb({ ksqldbURL: "http://192.168.1.201:8088" });
const PORT = 3005;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

/**
 * This is a simple API that returns the whitelist of MAC addresses, used by the consumers.
 * 
 * @returns {string[]} Whitelisted MAC addresses
 */
app.get("/api/general/whitelist", async (req, res, next) => {
    const response = await client.pull("SELECT * FROM WHITELISTED_THINGIES;");
    let whitelist = [];

    for(const [_, mac, whitelisted] of response.slice(1)) {
        if(whitelisted){
            whitelist.push(mac);
        }
    }

    res.json(whitelist);
});

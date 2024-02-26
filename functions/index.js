const { setGlobalOptions } = require("firebase-functions/v2");


setGlobalOptions({
    region: "asia-northeast1",
    memory: "1GB",
    concurrency: 40,
})

exports.webhook = require('./src/webhook')
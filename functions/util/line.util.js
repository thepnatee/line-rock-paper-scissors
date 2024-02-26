const functions = require("firebase-functions");
const crypto = require('crypto');
const axios = require("axios");


const LINE_MESSAGING_API = process.env.LINE_MESSAGING_API;
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;
const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN;


exports.getProfile = async (userId) => {
    try {
        return await axios({
            method: 'get',
            maxBodyLength: Infinity,
            url: `${LINE_MESSAGING_API}/profile/${userId}`,
            headers: {
                'Authorization': `Bearer ${LINE_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
        })
    } catch (error) {
        console.error("Error : ", error.data);
    }


};

exports.getProfileGroup = (groupId, userId) => {
    try {
        return axios({
            method: 'get',
            headers: {
                'Authorization': `Bearer ${LINE_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            url: `${LINE_MESSAGING_API}/group/${groupId}/member/${userId}`
        });
    } catch (error) {
        console.error("Error : ", error.data);
    }
};



exports.reply = async (token, payload) => {

    try {
        return await axios({
            method: "post",
            url: `${LINE_MESSAGING_API}/message/reply`,
            headers: {
                'Authorization': `Bearer ${LINE_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                replyToken: token,
                messages: payload
            })
        });
    } catch (error) {
        console.error("Error : ", error.data);
    }

};



exports.verifySignature = (originalSignature, body) => {

    const signature = crypto
        .createHmac("SHA256", LINE_CHANNEL_SECRET)
        .update(JSON.stringify(body))
        .digest("base64");

    if (signature !== originalSignature) {
        functions.logger.error("Unauthorized");
        return false;
    }
    return true;
};
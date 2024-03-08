exports.selectMessage = (userId, groupId, gameId) => {
    return {
        "type": "flex",
        "altText": "โปรดเลือกให้ดี",
        "contents": {
            "type": "carousel",
            "contents": [{
                    "type": "bubble",
                    "size": "micro",
                    "hero": {
                        "type": "image",
                        "url": "https://bucket.ex10.tech/images/70100a27-d45a-11ee-97d4-0242ac12000b/originalContentUrl.png",
                        "size": "full",
                        "aspectMode": "cover",
                        "aspectRatio": "320:213"
                    },
                    "body": {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [{
                            "type": "button",
                            "action": {
                                "type": "postback",
                                "label": "กระดาษ",
                                "data": `{"userId": "${userId}", "item": "paper", "gameId": "${gameId}" , "groupId": "${groupId}"}`
                            },
                            "style": "primary",
                            "color": "#050505"
                        }],
                        "spacing": "sm",
                        "paddingAll": "13px"
                    }
                },
                {
                    "type": "bubble",
                    "size": "micro",
                    "hero": {
                        "type": "image",
                        "url": "https://bucket.ex10.tech/images/7a5057bc-d45a-11ee-97d4-0242ac12000b/originalContentUrl.png",
                        "size": "full",
                        "aspectMode": "cover",
                        "aspectRatio": "320:213"
                    },
                    "body": {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [{
                            "type": "button",
                            "action": {
                                "type": "postback",
                                "label": "กรรไกร",
                                "data": `{"userId": "${userId}", "item": "scissors", "gameId": "${gameId}" , "groupId": "${groupId}"}`
                            },
                            "style": "primary",
                            "color": "#050505"
                        }],
                        "spacing": "sm",
                        "paddingAll": "13px"
                    }
                },
                {
                    "type": "bubble",
                    "size": "micro",
                    "hero": {
                        "type": "image",
                        "url": "https://bucket.ex10.tech/images/84873b75-d45a-11ee-97d4-0242ac12000b/originalContentUrl.png",
                        "size": "full",
                        "aspectMode": "cover",
                        "aspectRatio": "320:213"
                    },
                    "body": {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [{
                            "type": "button",
                            "action": {
                                "type": "postback",
                                "label": "ค้อน",
                                "data": `{"userId": "${userId}", "item": "rock", "gameId": "${gameId}" , "groupId": "${groupId}"}`
                            },
                            "style": "primary",
                            "color": "#050505"
                        }]
                    }
                },
                {
                    "type": "bubble",
                    "size": "micro",
                    "body": {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [{
                            "type": "button",
                            "action": {
                                "type": "postback",
                                "label": "จบเกม",
                                "displayText": "จบเกม",
                                "data": `{"userId":"${userId}", "item": "endgame","gameId":"${gameId}"}`
                            },
                            "color": "#ff0026"
                        }, {
                            "type": "text",
                            "text": "(เฉพาะผู้สร้างเกม)",
                            "size": "12px",
                            "color": "#fc030f"
                        }],
                        "alignItems": "center",
                        "justifyContent": "center"
                    }
                }
            ]
        }
    }

};
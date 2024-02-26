const quickReplyMember = {
    "items": [{
            "type": "action",
            "imageUrl": "https://bucket.ex10.tech/images/8d325cbc-d31f-11ee-97d4-0242ac12000b/originalContentUrl.png",
            "action": {
                "type": "message",
                "label": "เข้าร่วม",
                "text": "เข้าร่วม"
            }
        },
        {
            "type": "action",
            "imageUrl": "https://bucket.ex10.tech/images/c29daf78-d323-11ee-97d4-0242ac12000b/originalContentUrl.png",
            "action": {
                "type": "message",
                "label": "กติกา",
                "text": "กติกา"
            }
        },
        {
            "type": "action",
            "imageUrl": "https://bucket.ex10.tech/images/bdbdcdd7-d381-11ee-97d4-0242ac12000b/originalContentUrl.png",
            "action": {
                "type": "message",
                "label": "เริ่มเกมส์",
                "text": "เริ่มเกมส์"
            }
        },
        {
            "type": "action",
            "imageUrl": "https://bucket.ex10.tech/images/871f88ff-d3b0-11ee-97d4-0242ac12000b/originalContentUrl.png",
            "action": {
                "type": "message",
                "label": "ล้างเกมส์ของคุณ",
                "text": "ล้างเกมส์ของคุณ"
            }
        }
    ]
}
const quickReplyGame = {
    "items": [{
            "type": "action",
            "imageUrl": "https://bucket.ex10.tech/images/8d325cbc-d31f-11ee-97d4-0242ac12000b/originalContentUrl.png",
            "action": {
                "type": "message",
                "label": "สร้างเกมส์",
                "text": "สร้างเกมส์"
            }
        },
        {
            "type": "action",
            "imageUrl": "https://bucket.ex10.tech/images/871f88ff-d3b0-11ee-97d4-0242ac12000b/originalContentUrl.png",
            "action": {
                "type": "message",
                "label": "ล้างเกมส์ของคุณ",
                "text": "ล้างเกมส์ของคุณ"
            }
        }
    ]
}


exports.textMessageQuickReply = (text) => {
    return {
        "type": "text",
        "text": text,
        "quickReply": quickReplyMember
    }

};
exports.textMessageQuickReplyGame = (text) => {
    return {
        "type": "text",
        "text": text,
        "quickReply": quickReplyGame
    }

};

exports.ruleMessage = () => {
    return {
        "type": "text",
        "text": "มาดูวิธีการเล่นกัน\n1. รอจนสมาชิกพร้อม หรือ ครบทุกคน\n2. พิมพ์ เริ่มเกมส์ เพื่อเริ่มเกมส์ โดยทุกคนต้องเลือก ค้อน กรรไกร หรือ กระดาษ\n3. ผู้สร้างเกมส์ 1 คนต่อการ สร้างเกมส์ได้ 1 ครั้ง\n4. หากต้องการสร้างเกมส์ใหม่ต้องพิมพ์ จบเกมส์ ก่อนเสมอ\n5. เงื่อนไขการเล่น หรือ บทลงโทษเป็นไปตามผู้สร้างเกมส์กำหนด ขอให้สนุกกับเป้ายิ้งฉุบ",
        "quickReply": quickReplyMember
    }

};


exports.selectMessage = (userId, groupId, gameId) => {
    return {
        "type": "flex",
        "altText": "โปรดเลือกให้ดี",
        "contents": {
          "type": "carousel",
          "contents": [
            {
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
                "contents": [
                  {
                    "type": "button",
                    "action": {
                      "type": "postback",
                      "label": "กระดาษ",
                      "data": `{"userId": "${userId}", "item": "paper", "gameId": "${gameId}" , "groupId": "${groupId}"}`
                    },
                    "style": "primary",
                    "color": "#050505"
                  }
                ],
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
                "contents": [
                  {
                    "type": "button",
                    "action": {
                      "type": "postback",
                      "label": "กรรไกร",
                      "data": `{"userId": "${userId}", "item": "scissors", "gameId": "${gameId}" , "groupId": "${groupId}"}`
                    },
                    "style": "primary",
                    "color": "#050505"
                  }
                ],
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
                "contents": [
                  {
                    "type": "button",
                    "action": {
                      "type": "postback",
                      "label": "ค้อน",
                      "data": `{"userId": "${userId}", "item": "rock", "gameId": "${gameId}" , "groupId": "${groupId}"}`
                    },
                    "style": "primary",
                    "color": "#050505"
                  }
                ]
              }
            },
            {
              "type": "bubble",
              "size": "micro",
              "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                  {
                    "type": "button",
                    "action": {
                        "type": "postback",
                        "label": "จบเกมส์",
                        "displayText": "จบเกมส์",
                        "data": `{"userId":"${userId}", "item": "endgame","gameId":"${gameId}"}`
                    },
                    "color": "#ff0026"
                  }
                ],
                "alignItems": "center",
                "justifyContent": "center"
              }
            }
          ]
        }
      }

};

exports.textMessage = (text) => {
    return {
        type: "text",
        text: text
    }
}
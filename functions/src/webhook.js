const {
    onRequest
} = require("firebase-functions/v2/https");
const line = require('../util/line.util');
const messages = require('../messages/messages');
const firebase = require('../util/firebase.util');

exports.receive = onRequest(async (req, res) => {

    if (req.method !== "POST") {
        return res.send(req.method);
    }

    if (!line.verifySignature(req.headers["x-line-signature"], req.body)) {
        return res.status(401).send("Unauthorized");
    }
    const events = req.body.events

    for (const event of events) {

        const userId = event.source.userId
        const groupId = event.source.groupId

        // Check Using LINE Chatbot with LINE Group Only
        if (event.source.type !== "group") {
            return res.end();
        }

        // Invite LINE Offcial Account : เป้ายิ้งฉุบ
        // [IMPORTANT] Enable Toggle : Feature Allow account to join groups and multi-person chats
        // https://developers.line.biz/en/reference/messaging-api/#join-event
        if (event.type === "join") {
            await line.reply(event.replyToken, [messages.textMessageQuickReply("สวัสดี ทุกคน มาเริ่มเกมส์เป้ายิ้งฉุบกันนน \n ถ้าทุกคนพร้อมแล้วไปดู กติกา กันก่อน ")])
            return res.end();
        }

        // Invite User Player 
        // https://developers.line.biz/en/reference/messaging-api/#member-joined-event
        if (event.type === "memberJoined") {
            for (let member of event.joined.members) {
                if (member.type === "user") {
                    // DB Query for Game Start 
                    const count = await firebase.getCountGameGroupStatus(groupId, false)
                    // Check Status Playing 
                    if (count === 0) {
                        await line.reply(event.replyToken, [messages.textMessageQuickReply("ยินดีต้อนรับสมาชิกใหม่ กด 'เข้าร่วม' เพื่อทักทายทุกคนและ เข้าร่วมเกมส์ ")])
                    } else {
                        await line.reply(event.replyToken, [messages.textMessage("ยินดีต้อนรับสมาชิกใหม่ ขณะนี้เกมส์กำลังดำเนินการอยู่ กรุณารอรอบถัดไป")])
                    }
                }
            }
            return res.end();
        }

        // https://developers.line.biz/en/reference/messaging-api/#leave-event
        if (event.type === "leave") {
            // Delete Game Document when LINE OA Leave Group
            await firebase.deleteGameGroup(groupId)
            return res.end();
        }
        if (event.type === "message" && event.message.type === "text") {
            const lineProfile = await line.getProfile(userId)

            let textMessage = event.message.text
            if (textMessage === "กติกา") {
                await line.reply(event.replyToken, [messages.ruleMessage()])
            } else if (textMessage === "เข้าร่วม") {
                await line.reply(event.replyToken, [messages.textMessageQuickReply(`คุณ ${lineProfile.data.displayName}ได้เข้าร่วมเกมส์เรียบร้อยแล้ว `)])
            } else if (textMessage === "เริ่มเกมส์") {
                await line.reply(event.replyToken, [messages.textMessageQuickReplyGame("วรยุทธใต้หล้าตัดสินแพ้ชนะวัดที่ความเร็ว  \n เมื่อผู้สร้างพร้อมเกมส์ กด 'สร้างเกมส์' \n\n หากสร้างเกมส์แล้วจะไม่สามารถสร้างทับได้")])
            } else if (textMessage === "ล้างเกมส์ของคุณ") {
                await firebase.deleteGameGroup(groupId)
                await line.reply(event.replyToken, [messages.textMessageQuickReplyGame(`ระบบได้ลบเกมส์ของ ${lineProfile.data.displayName} เรียบร้อย`)])
            } else if (textMessage === "สร้างเกมส์") {
                // Check Duplicate for Create Game 
                const count = await firebase.getCountGameGroupStatus(groupId, false)
                if (count === 0) {
                    const resultId = await firebase.createGame(userId, groupId)
                    await line.reply(event.replyToken, [messages.selectMessage(userId, groupId, resultId)])
                } else {
                    await line.reply(event.replyToken, [messages.textMessage("เกมส์ได้ถูกสร้างแล้วไม่สามารถสร้างทับกันได้")])
                }
            }
            return res.end();

        }
        if (event.type === "postback") {

            const data = JSON.parse(event.postback.data)

            if (data.item === "rock" || data.item === "paper" || data.item === "scissors") {
                const checkGameStatus = await firebase.getCheckGameGroupStatus(groupId, data.gameId)
                if (checkGameStatus) {
                    const result = await firebase.updateInsertOwnerSelect(groupId, data.gameId, data.item, userId)
                    if (result) {
                        if (result === "done") {
                            await line.reply(event.replyToken, [messages.textMessage("ตอนนี้ ผู้สร้างห้องได้ทำการเลือกแล้ว ทุกคนรีบเลือกด่วน!")])
                        } else {
                            await line.reply(event.replyToken, [messages.textMessage("ถึงแม้เป็น ผู้สร้างห้อง ก็เปลี่ยนใจไม่ได้!")])
                        }
                        return res.end();
                    } else {

                        const result = await firebase.updateInsertJoinerSelect(groupId, data.gameId, data.item, userId)
                        const lineProfile = await line.getProfileGroup(groupId, userId)

                        let msgMemberSelect = `ขณะนี้ ${lineProfile.data.displayName} ได้ทำการเลือกแล้ว!`
                        if (!result) {
                            msgMemberSelect = `คุณ ${lineProfile.data.displayName} ไม่สามารถเปลี่ยนใจได้`
                        }
                        await line.reply(event.replyToken, [messages.textMessage(msgMemberSelect)])
                    }
                }


            }
            if (data.item === "endgame") {
                const result = await firebase.endGame(groupId, userId, data.gameId)

                if (result) {

                    const dataItem = await firebase.getUserByGame(groupId, data.gameId, userId);

                    let userWin = [];
                    let userEqual = [];
                    let userLoss = [];

                    const ownerLineProfile = await line.getProfileGroup(groupId, userId);

                    if (!dataItem.ownerSelect || dataItem.users.length === 0) {
                        await line.reply(event.replyToken, [messages.textMessageQuickReplyGame("เกมส์ได้สิ้นสุดลง แบบไม่สมบูรณ์ กรุณาเริ่มต้นเกมส์ใหม่อีกครั้ง")]);
                    } else {
                        let memberNo = 1;
                        for (const userObject of dataItem.users) {
                            const memberId = Object.keys(userObject)[0];

                            const lineProfile = await line.getProfileGroup(groupId, memberId);

                            const userSelection = userObject[memberId];
                            const ownerSelection = dataItem.ownerSelect;

                            if (userSelection === ownerSelection) {
                                userEqual.push(lineProfile.data);

                            } else {
                                const userWinsAgainst = {
                                    'rock': 'scissors',
                                    'paper': 'rock',
                                    'scissors': 'paper'
                                };

                                if (userWinsAgainst[userSelection] === ownerSelection) {
                                    userWin.push(lineProfile.data);

                                } else {
                                    userLoss.push(lineProfile.data);
                                }
                            }
                        }



                        let nameList = 'ผู้สร้างห้อง ' + ownerLineProfile.data.displayName + ' เลือก ' + dataItem.ownerSelect;
                        const appendUsers = (list, label, emoji) => {
                            if (list.length > 0) {
                                nameList += `\n-----${label}-----`;
                                list.forEach((memberList) => {
                                    nameList += `\n ${memberNo}.${memberList.displayName} ${emoji}`;
                                    memberNo++;
                                });
                            }
                        };

                        appendUsers(userWin, "ผู้ชนะได้แก่", "✅");
                        appendUsers(userEqual, "ผู้เสมอได้แก่", "😉");
                        appendUsers(userLoss, "ผู้แพ้ได้แก่", "❌");

                        nameList += "\n------ \nแพ้เป็นพระ คนชนะคนนี้เป็นของเธอนะ";

                        await line.reply(event.replyToken, [messages.textMessageEndGame(nameList)]);
                    }


                } else {
                    await line.reply(event.replyToken, [messages.textMessage("ไม่พบสิทธิ์การจบเกมส์ของท่าน หรือ เกมส์นี้ที่ท่านเลือกอาจจบลงแล้ว")])
                }
            }

            return res.end();

        }

    }

    return res.send(req.method);

});
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
                        }
                        return res.end();
                    } else {
                        const lineProfile = await line.getProfileGroup(groupId, userId)
                        await firebase.updateInsertJoinerSelect(groupId, data.gameId, data.item, userId)
                        await line.reply(event.replyToken, [messages.textMessage(`ขณะนี้ ${lineProfile.data.displayName} ได้ทำการเลือกแล้ว!`)])
                    }
                }


            }
            if (data.item === "endgame") {
                const result = await firebase.endGame(groupId, userId, data.gameId)
                if (result) {

                    const dataItem = await firebase.getUserByGame(groupId, data.gameId, userId)
                    let userWin = []
                    let userEqual = []
                    let userLoss = []
                    let ownerLineProfile = await line.getProfileGroup(groupId, userId)
                    for (const [index, userObject] of dataItem.users.entries()) {
                        let memberId = Object.keys(userObject)[0];
                        let lineProfile = await line.getProfileGroup(groupId, memberId)

                        if ((userObject[memberId] === 'rock' && dataItem.ownerSelect === 'scissors') ||
                            (userObject[memberId] === 'paper' && dataItem.ownerSelect === 'rock') ||
                            (userObject[memberId] === 'scissors' && dataItem.ownerSelect === 'paper')) {
                            userWin.push(lineProfile.data)
                        } else if (
                            (userObject[memberId] === 'rock' && dataItem.ownerSelect === 'rock') ||
                            (userObject[memberId] === 'paper' && dataItem.ownerSelect === 'paper') ||
                            (userObject[memberId] === 'scissors' && dataItem.ownerSelect === 'scissors')
                        ) {
                            userEqual.push(lineProfile.data)

                        } else {
                            userLoss.push(lineProfile.data)
                        }
                    }

                    if (!dataItem.ownerSelect || dataItem.users.length === 0) {
                        await line.reply(event.replyToken, [messages.textMessageQuickReplyGame("เกมส์ได้สิ้นสุดลง แบบไม่สมบูรณ์ กรุณาเริ่มต้นเกมส์ใหม่อีกครั้ง")]);
                    } else {
                        let memberNo = 1
                        let nameList = 'ผู้สร้างห้อง ' + ownerLineProfile.data.displayName + ' เลือก ' + dataItem.ownerSelect
                        if (userWin.length > 0) {
                            nameList += "\n-----ผู้ชนะได้แก่----- "
                            userWin.forEach((memberList) => {
                                nameList += " \n " + memberNo + "." + memberList.displayName + " ✅"
                                memberNo++
                            });
                        }
                         if (userEqual.length > 0) {
                            nameList += "\n-----ผู้เสมอได้แก่----- "
                            userEqual.forEach((memberList) => {
                                nameList += " \n " + memberNo + "." + memberList.displayName + " 😉"
                                memberNo++
                            });
                        } 
                        if(userLoss.length > 0) {
                            nameList += "\n-----ผู้แพ้ได้แก่----- "
                            userLoss.forEach((memberList) => {
                                nameList += " \n " + memberNo + "." + memberList.displayName + " ❌"
                                memberNo++
                            });
                        }

                        nameList += "\n------ \n "
                        nameList += "แพ้เป็นพระ คนชนะคนนี้เป็นของเธอนะ"

                        await line.reply(event.replyToken, [messages.textMessageQuickReply(nameList)]);
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
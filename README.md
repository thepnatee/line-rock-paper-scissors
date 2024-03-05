
# LINE เป้ายิ้งฉุบ

Shell Directory Folder
````
cd functions
````

Rename File Environment

````
mv .env.example .env
````

## Edit .env
1. LINE_CHANNEL_SECRET= 'LINE Developer Console'
2. LINE_CHANNEL_ACCESS_TOKEN='LINE Developer Console'

-----

## Start Project 

Install Package

````
npm i
````

Firebase Emulator Start Project
````
firebase emulators:start
````

Deploy (Noted : Only Package Blaze Plan )
- Cloud Fuction for firebase
- Cloud Firestore

````
firebase deploy
````

-----
## LINE API


1. Join to Chat Group
https://developers.line.biz/en/reference/messaging-api/#join-event


2. Member Joined to Chat Group
https://developers.line.biz/en/reference/messaging-api/#member-joined-event
        

3. Event Message
https://developers.line.biz/en/reference/messaging-api/#message-event

4. Member Leave From Chat Group
https://developers.line.biz/en/reference/messaging-api/#member-left-event

5. Leave From Chat Group
https://developers.line.biz/en/reference/messaging-api/#leave-event


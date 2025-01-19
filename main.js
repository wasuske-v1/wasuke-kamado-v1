//Zenitsu-Bot8



require('./settings')

const pino = require('pino')

const { Boom } = require('@hapi/boom')

const fs = require('fs')

const chalk = require('chalk')

const { color } = require('./lib/color')

const FileType = require('file-type')

const path = require('path')

const axios = require('axios')

const _ = require('lodash')

const { uncache, nocache } = require('./lib/loader')

const yargs = require('yargs/yargs')

const { Low, JSONFile } = require('./lib/lowdb')

const moment = require('moment-timezone')

const PhoneNumber = require('awesome-phonenumber')

const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif')

const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetch, await, sleep, reSize } = require('./lib/myfunc')

const { default: DeepakBotIncConnect, delay, PHONENUMBER_MCC, makeCacheableSignalKeyStore, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, generateForwardMessageContent, prepareWAMessageMedia, generateWAMessageFromContent, generateMessageID, downloadContentFromMessage, makeInMemoryStore, jidDecode, proto, Browsers } = require("@whiskeysockets/baileys")

const NodeCache = require("node-cache")

const Pino = require("pino")

const readline = require("readline")

const { parsePhoneNumber } = require("libphonenumber-js")

const makeWASocket = require("@whiskeysockets/baileys").default



const store = makeInMemoryStore({

    logger: pino().child({

        level: 'silent',

        stream: 'store'

    })

})



global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())

global.db = new Low(new JSONFile(`src/database.json`))



global.DATABASE = global.db

global.loadDatabase = async function loadDatabase() {

  if (global.db.READ) return new Promise((resolve) => setInterval(function () { (!global.db.READ ? (clearInterval(this), resolve(global.db.data == null ? global.loadDatabase() : global.db.data)) : null) }, 1 * 1000))

  if (global.db.data !== null) return

  global.db.READ = true

  await global.db.read()

  global.db.READ = false

  global.db.data = {

    users: {},

    database: {},

    chats: {},

    game: {},

    settings: {},

    message: {},

    ...(global.db.data || {})

  }

  global.db.chain = _.chain(global.db.data)

}

loadDatabase()



if (global.db) setInterval(async () => {

   if (global.db.data) await global.db.write()

}, 30 * 1000)



require('./Zenitsu8.js')

nocache('../Zenitsu8.js', module => console.log(color('[ CHANGE ]', 'green'), color(`'${module}'`, 'green'), 'Updated'))

require('./main.js')

nocache('../main.js', module => console.log(color('[ CHANGE ]', 'green'), color(`'${module}'`, 'green'), 'Updated'))



let phoneNumber = "917029257330"

let owner = JSON.parse(fs.readFileSync('./src/data/role/owner.json'))



const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code")

const useMobile = process.argv.includes("--mobile")



const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

const question = (text) => new Promise((resolve) => rl.question(text, resolve))

         

async function startDeepakBotInc() {

//------------------------------------------------------

let { version, isLatest } = await fetchLatestBaileysVersion()

const {  state, saveCreds } =await useMultiFileAuthState(`./session`)

    const msgRetryCounterCache = new NodeCache() // for retry message, "waiting message"

    const DeepakBotInc = makeWASocket({

        logger: pino({ level: 'silent' }),

        printQRInTerminal: !pairingCode, // popping up QR in terminal log

      browser: Browsers.windows('Firefox'), // for this issues https://github.com/WhiskeySockets/Baileys/issues/328

      patchMessageBeforeSending: (message) => {

            const requiresPatch = !!(

                message.buttonsMessage ||

                message.templateMessage ||

                message.listMessage

            );

            if (requiresPatch) {

                message = {

                    viewOnceMessage: {

                        message: {

                            messageContextInfo: {

                                deviceListMetadataVersion: 2,

                                deviceListMetadata: {},

                            },

                            ...message,

                        },

                    },

                };

            }

            return message;

        },

     auth: {

         creds: state.creds,

         keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "fatal" }).child({ level: "fatal" })),

      },

      markOnlineOnConnect: true, // set false for offline

      generateHighQualityLinkPreview: true, // make high preview link

      getMessage: async (key) => {

            if (store) {

                const msg = await store.loadMessage(key.remoteJid, key.id)

                return msg.message || undefined

            }

            return {

                conversation: "Cheems Bot Here!"

            }

        },

      msgRetryCounterCache, // Resolve waiting messages

      defaultQueryTimeoutMs: undefined, // for this issues https://github.com/WhiskeySockets/Baileys/issues/276

   })

   

   store.bind(DeepakBotInc.ev)



    // login use pairing code

   // source code https://github.com/WhiskeySockets/Baileys/blob/master/Example/example.ts#L61

   if (pairingCode && !DeepakBotInc.authState.creds.registered) {

      if (useMobile) throw new Error('Cannot use pairing code with mobile api')



      let phoneNumber

      if (!!phoneNumber) {

         phoneNumber = phoneNumber.replace(/[^0-9]/g, '')



         if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {

            console.log(chalk.bgBlack(chalk.redBright("Start with country code of your WhatsApp Number, Example : +917029257330")))

            process.exit(0)

         }

      } else {

         phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number 😍\nFor example: +917029257330 : `)))

         phoneNumber = phoneNumber.replace(/[^0-9]/g, '')



         // Ask again when entering the wrong number

         if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {

            console.log(chalk.bgBlack(chalk.redBright("Start with country code of your WhatsApp Number, Example : +917029257330")))



            phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number 😍\nFor example: +917029257330 : `)))

            phoneNumber = phoneNumber.replace(/[^0-9]/g, '')

            rl.close()

         }

      }



      setTimeout(async () => {

         let code = await DeepakBotInc.requestPairingCode(phoneNumber)

         code = code?.match(/.{1,4}/g)?.join("-") || code

         console.log(chalk.black(chalk.bgGreen(`Your Pairing Code : `)), chalk.black(chalk.white(code)))

      }, 3000)

   }

   

   DeepakBotInc.ev.on('connection.update', async (update) => {

	const {

		connection,

		lastDisconnect

	} = update

try{

		if (connection === 'close') {

			let reason = new Boom(lastDisconnect?.error)?.output.statusCode

			if (reason === DisconnectReason.badSession) {

				console.log(`Bad Session File, Please Delete Session and Scan Again`);

				startDeepakBotInc()

			} else if (reason === DisconnectReason.connectionClosed) {

				console.log("Connection closed, reconnecting....");

				startDeepakBotInc();

			} else if (reason === DisconnectReason.connectionLost) {

				console.log("Connection Lost from Server, reconnecting...");

				startDeepakBotInc();

			} else if (reason === DisconnectReason.connectionReplaced) {

				console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First");

				startDeepakBotInc()

			} else if (reason === DisconnectReason.loggedOut) {

				console.log(`Device Logged Out, Please Delete Session and Scan Again.`);

				startDeepakBotInc();

			} else if (reason === DisconnectReason.restartRequired) {

				console.log("Restart Required, Restarting...");

				startDeepakBotInc();

			} else if (reason === DisconnectReason.timedOut) {

				console.log("Connection TimedOut, Reconnecting...");

				startDeepakBotInc();

			} else DeepakBotInc.end(`Unknown DisconnectReason: ${reason}|${connection}`)

		}

		if (update.connection == "connecting" || update.receivedPendingNotifications == "false") {

			console.log(color(`\n🌿Connecting...`, 'yellow'))

		}

		if (update.connection == "open" || update.receivedPendingNotifications == "true") {

			console.log(color(` `,'magenta'))

            console.log(color(`🌿Connected to => ` + JSON.stringify(DeepakBotInc.user, null, 2), 'yellow'))

            console.log(chalk.yellow(`\n\n               ${chalk.bold.blue(`[ ${botname} ]`)}\n\n`))

            console.log(color(`< ================================================== >`, 'cyan'))

	        console.log(color(`\n${themeemoji} YT CHANNEL: Deepak`,'magenta'))

            console.log(color(`${themeemoji} GITHUB: DGDEEPAK `,'magenta'))

            console.log(color(`${themeemoji} INSTAGRAM: @deepakgupta8931 `,'magenta'))

            console.log(color(`${themeemoji} WA NUMBER: ${owner}`,'magenta'))

            console.log(color(`${themeemoji} CREDIT: ${wm}\n`,'magenta'))

		}

	

} catch (err) {

	  console.log('Error in Connection.update '+err)

	  startDeepakBotInc()

	}

})

DeepakBotInc.ev.on('creds.update', saveCreds)

DeepakBotInc.ev.on("messages.upsert",  () => { })

//------------------------------------------------------



//farewell/welcome

    DeepakBotInc.ev.on('group-participants.update', async (anu) => {

    	if (global.welcome){

console.log(anu)

try {

let metadata = await DeepakBotInc.groupMetadata(anu.id)

let participants = anu.participants

for (let num of participants) {

try {

ppuser = await DeepakBotInc.profilePictureUrl(num, 'image')

} catch (err) {

ppuser = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60'

}

try {

ppgroup = await DeepakBotInc.profilePictureUrl(anu.id, 'image')

} catch (err) {

ppgroup = 'https://i.ibb.co/RBx5SQC/avatar-group-large-v2.png?q=60'

}

//welcome\\

memb = metadata.participants.length

DeepakWlcm = await getBuffer(ppuser)

DeepakLft = await getBuffer(ppuser)

                if (anu.action == 'add') {

                const deepakbuffer = await getBuffer(ppuser)

                let deepakName = num

                const xtime = moment.tz('Asia/Kolkata').format('HH:mm:ss')

	            const xdate = moment.tz('Asia/Kolkata').format('DD/MM/YYYY')

	            const xmembers = metadata.participants.length

                deepakbody = `Hello @${deepakName.split("@")[0]},

I am *ZenitsuBot*, Welcome to ${metadata.subject}.

*Group Description:*

${metadata.desc}`

let msgs = generateWAMessageFromContent(anu.id, {

  viewOnceMessage: {

    message: {

        "messageContextInfo": {

          "deviceListMetadata": {},

          "deviceListMetadataVersion": 2

        },

        interactiveMessage: proto.Message.InteractiveMessage.create({

          body: proto.Message.InteractiveMessage.Body.create({

            text: deepakbody

          }),

          footer: proto.Message.InteractiveMessage.Footer.create({

            text: botname

          }),

          header: proto.Message.InteractiveMessage.Header.create({

          hasMediaAttachment: false,

          ...await prepareWAMessageMedia({ image: DeepakWlcm }, { upload: DeepakBotInc.waUploadToServer })

          }),

          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({

            buttons: [{

            "name": "quick_reply",

              "buttonParamsJson": `{\"display_text\":\"Welcome 💐\",\"id\":\"\"}`

            }],

          }),

          contextInfo: {

                  mentionedJid: [num], 

                  forwardingScore: 999,

                  isForwarded: true,

                forwardedNewsletterMessageInfo: {

                  newsletterJid: '120363222395675670@newsletter',

                  newsletterName: ownername,

                  serverMessageId: 143

                }

                }

       })

    }

  }

}, {})

DeepakBotInc.relayMessage(anu.id, msgs.message, {})

                } else if (anu.action == 'remove') {

                	const deepakbuffer = await getBuffer(ppuser)

                    const deepaktime = moment.tz('Asia/Kolkata').format('HH:mm:ss')

	                const deepakdate = moment.tz('Asia/Kolkata').format('DD/MM/YYYY')

                	let deepakName = num

                    const deepakmembers = metadata.participants.length

                    deepakbody = `GoodBye 👋, @${deepakName.split("@")[0]}`

let msgs = generateWAMessageFromContent(anu.id, {

  viewOnceMessage: {

    message: {

        "messageContextInfo": {

          "deviceListMetadata": {},

          "deviceListMetadataVersion": 2

        },

        interactiveMessage: proto.Message.InteractiveMessage.create({

          body: proto.Message.InteractiveMessage.Body.create({

            text: deepakbody

          }),

          footer: proto.Message.InteractiveMessage.Footer.create({

            text: botname

          }),

          header: proto.Message.InteractiveMessage.Header.create({

          hasMediaAttachment: false,

          ...await prepareWAMessageMedia({ image: DeepakLft }, { upload: DeepakBotInc.waUploadToServer })

          }),

          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({

            buttons: [{

            "name": "quick_reply",

              "buttonParamsJson": `{\"display_text\":\"Goodbye 👋\",\"id\":\"\"}`

            }],

          }),

          contextInfo: {

                  mentionedJid: [num], 

                  forwardingScore: 999,

                  isForwarded: true,

                forwardedNewsletterMessageInfo: {

                  newsletterJid: '120363222395675670@newsletter',

                  newsletterName: ownername,

                  serverMessageId: 143

                }

                }

       })

    }

  }

}, {})

DeepakBotInc.relayMessage(anu.id, msgs.message, {})

}

}

} catch (err) {

console.log(err)

}

}

})

// Anti Call

    DeepakBotInc.ev.on('call', async (DeepakPapa) => {

    	if (global.anticall){

    console.log(DeepakPapa)

    for (let DeepakFucks of DeepakPapa) {

    if (DeepakFucks.isGroup == false) {

    if (DeepakFucks.status == "offer") {

    let DeepakBlokMsg = await DeepakBotInc.sendTextWithMentions(DeepakFucks.from, `*${DeepakBotInc.user.name}* can't receive ${DeepakFucks.isVideo ? `video` : `voice` } call. Sorry @${DeepakFucks.from.split('@')[0]} you will be blocked. If called accidentally please contact the owner to be unblocked !`)

    DeepakBotInc.sendContact(DeepakFucks.from, owner, DeepakBlokMsg)

    await sleep(8000)

    await DeepakBotInc.updateBlockStatus(DeepakFucks.from, "block")

    }

    }

    }

    }

    })

    //autostatus view

        DeepakBotInc.ev.on('messages.upsert', async chatUpdate => {

        	if (global.antiswview){

            mek = chatUpdate.messages[0]

            if (mek.key && mek.key.remoteJid === 'status@broadcast') {

            	await DeepakBotInc.readMessages([mek.key]) }

            }

    })

    //admin event

    DeepakBotInc.ev.on('group-participants.update', async (anu) => {

    	if (global.adminevent){

console.log(anu)

try {

let participants = anu.participants

for (let num of participants) {

try {

ppuser = await DeepakBotInc.profilePictureUrl(num, 'image')

} catch (err) {

ppuser = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60'

}

try {

ppgroup = await DeepakBotInc.profilePictureUrl(anu.id, 'image')

} catch (err) {

ppgroup = 'https://i.ibb.co/RBx5SQC/avatar-group-large-v2.png?q=60'

}

 if (anu.action == 'promote') {

const deepaktime = moment.tz('Asia/Kolkata').format('HH:mm:ss')

const deepakdate = moment.tz('Asia/Kolkata').format('DD/MM/YYYY')

let deepakName = num

deepakbody = ` 𝗖𝗼𝗻𝗴𝗿𝗮𝘁𝘀🎉 @${deepakName.split("@")[0]}, you have been *promoted* to *admin* 🥳`

   DeepakBotInc.sendMessage(anu.id,

 { text: deepakbody,

 contextInfo:{

 mentionedJid:[num],

 "externalAdReply": {"showAdAttribution": true,

 "containsAutoReply": true,

 "title": ` ${global.botname}`,

"body": `${ownername}`,

 "previewType": "PHOTO",

"thumbnailUrl": ``,

"thumbnail": DeepakWlcm,

"sourceUrl": `${wagc}`}}})

} else if (anu.action == 'demote') {

const deepaktime = moment.tz('Asia/Kolkata').format('HH:mm:ss')

const deepakdate = moment.tz('Asia/Kolkata').format('DD/MM/YYYY')

let deepakName = num

deepakbody = `𝗢𝗼𝗽𝘀‼️ @${deepakName.split("@")[0]}, you have been *demoted* from *admin* 😬`

DeepakBotInc.sendMessage(anu.id,

 { text: deepakbody,

 contextInfo:{

 mentionedJid:[num],

 "externalAdReply": {"showAdAttribution": true,

 "containsAutoReply": true,

 "title": ` ${global.botname}`,

"body": `${ownername}`,

 "previewType": "PHOTO",

"thumbnailUrl": ``,

"thumbnail": DeepakLft,

"sourceUrl": `${wagc}`}}})

}

}

} catch (err) {

console.log(err)

}

}

})



// detect group update

		DeepakBotInc.ev.on("groups.update", async (json) => {

			if (global.groupevent) {

			try {

ppgroup = await DeepakBotInc.profilePictureUrl(anu.id, 'image')

} catch (err) {

ppgroup = 'https://i.ibb.co/RBx5SQC/avatar-group-large-v2.png?q=60'

}

			console.log(json)

			const res = json[0]

			if (res.announce == true) {

				await sleep(2000)

				DeepakBotInc.sendMessage(res.id, {

					text: `「 Group Settings Change 」\n\nGroup has been closed by admin, Now only admins can send messages !`,

				})

			} else if (res.announce == false) {

				await sleep(2000)

				DeepakBotInc.sendMessage(res.id, {

					text: `「 Group Settings Change 」\n\nThe group has been opened by admin, Now participants can send messages !`,

				})

			} else if (res.restrict == true) {

				await sleep(2000)

				DeepakBotInc.sendMessage(res.id, {

					text: `「 Group Settings Change 」\n\nGroup info has been restricted, Now only admin can edit group info !`,

				})

			} else if (res.restrict == false) {

				await sleep(2000)

				DeepakBotInc.sendMessage(res.id, {

					text: `「 Group Settings Change 」\n\nGroup info has been opened, Now participants can edit group info !`,

				})

			} else if(!res.desc == ''){

				await sleep(2000)

				DeepakBotInc.sendMessage(res.id, { 

					text: `「 Group Settings Change 」\n\n*Group description has been changed to*\n\n${res.desc}`,

				})

      } else {

				await sleep(2000)

				DeepakBotInc.sendMessage(res.id, {

					text: `「 Group Settings Change 」\n\n*Group name has been changed to*\n\n*${res.subject}*`,

				})

			} 

			}

		})

		

		// respon cmd pollMessage

    async function getMessage(key){

        if (store) {

            const msg = await store.loadMessage(key.remoteJid, key.id)

            return msg?.message

        }

        return {

            conversation: "Cheems Bot Here!"

        }

    }

    DeepakBotInc.ev.on('messages.update', async chatUpdate => {

        for(const { key, update } of chatUpdate) {

			if(update.pollUpdates && key.fromMe) {

				const pollCreation = await getMessage(key)

				if(pollCreation) {

				    const pollUpdate = await getAggregateVotesInPollMessage({

							message: pollCreation,

							pollUpdates: update.pollUpdates,

						})

	                var toCmd = pollUpdate.filter(v => v.voters.length !== 0)[0]?.name

	                if (toCmd == undefined) return

                    var prefCmd = xprefix+toCmd

	                DeepakBotInc.appenTextMessage(prefCmd, chatUpdate)

				}

			}

		}

    })



    DeepakBotInc.ev.on('messages.upsert', async chatUpdate => {

        //console.log(JSON.stringify(chatUpdate, undefined, 2))

        try {

    

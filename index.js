const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');

const { state, saveState } = useSingleFileAuthState('./session.json');

async function startBot() {
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
    });

    sock.ev.on('creds.update', saveState);

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const messageContent = msg.message.conversation || msg.message.extendedTextMessage?.text;
        const sender = msg.key.remoteJid;

        if (messageContent && messageContent.includes('http')) {
            await sock.sendMessage(sender, { text: '⚠️ Usitume link kwenye group! Unatakiwa kufuata sheria.' });
            // Uncomment to auto-kick (be careful!)
            // await sock.groupParticipantsUpdate(sender, [msg.key.participant], "remove");
        }
    });
}

startBot();
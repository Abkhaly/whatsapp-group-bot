const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(), // inahifadhi session kuepuka QR kila mara
    puppeteer: { headless: true }
});

// Badilisha hizi group IDs na group zako halisi
const groupMapishi = '123456789-123456789@g.us';  // Group: Mapishi Online (Zanzibar kitchen)
const groupTest = '987654321-123456789@g.us';    // Group: Test (hii ni mfano, badilisha au ondoa)

const morningMessages = [
    "Asubuhi njema! Leo tunapika chakula kitamu cha Zanzibar 🌴🍲",
    "Habari za asubuhi! Mapishi ya leo yanakuja na ladha ya kipekee 😊",
    "Mchana mwema na upishi mzuri! Endelea kufurahia mapishi yetu ya Zanzibar."
];

// Print QR Code terminal
client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
    console.log('Tafadhali scan QR code kwenye WhatsApp app yako.');
});

client.on('ready', () => {
    console.log('Bot iko tayari!');

    // Tuma ujumbe wa asubuhi kila saa 6 asubuhi (06:00)
    setInterval(() => {
        sendMorningMessage(groupMapishi);
    }, 24 * 60 * 60 * 1000);  // mara moja kwa siku (24h)

    // Tuma mara moja kwanza bot ianze
    sendMorningMessage(groupMapishi);
});

client.on('message', async msg => {
    const chat = await msg.getChat();

    // Kama ni group na group ID inaitwa Mapishi
    if(chat.isGroup) {
        const groupId = chat.id._serialized;

        // Karibu wanajamii wapya
        if(msg.body === '!karibu' && groupId === groupMapishi) {
            client.sendMessage(groupId, `Karibu sana kwenye group la Mapishi Online (Zanzibar kitchen)! Furahia mapishi yetu ya kipekee. 🍽️🌺`);
        }

        // Tuma onyo au futa ujumbe kama ni link, picha au matangazo
        if(msg.body) {
            // Angalia kama ni link
            const isLink = msg.body.match(/https?:\/\/\S+/gi);
            // Angalia kama ni ujumbe wa matangazo (biashara)
            const isBusiness = msg.body.toLowerCase().includes('biashara') || msg.body.toLowerCase().includes('advertisement');
            // Angalia kama ni picha
            const isMedia = msg.hasMedia;

            if(isLink || isMedia || isBusiness) {
                try {
                    await msg.delete(true);  // futa message
                    // Tuma onyo mara moja
                    await client.sendMessage(msg.from, '⚠️ Tafadhali usitumie link, picha au matangazo kwenye group hili.');
                } catch(e) {
                    console.log('Kosa kufuta ujumbe:', e);
                }
            }
        }

        // Jibu salamu za kawaida
        const greetings = ['hujambo', 'habari', 'shikamoo', 'sijambo', 'asante', 'salamu'];
        if(greetings.some(greet => msg.body.toLowerCase().includes(greet))) {
            client.sendMessage(msg.from, 'Habari! Karibu kwenye Mapishi Online (Zanzibar kitchen). 😊');
        }
    }
});

async function sendMorningMessage(groupId) {
    const randomIndex = Math.floor(Math.random() * morningMessages.length);
    const message = morningMessages[randomIndex];
    client.sendMessage(groupId, message);
}

// Anza bot
client.initialize();

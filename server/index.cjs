const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const { createAdminCard, createCustomerCard, createCancellationCard, createReviewCard, createReviewResultCard } = require('./cardGenerator.cjs');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'db.json');
const OWNER_PHONE = '905510630220@s.whatsapp.net'; // Baileys format

app.use(cors());
app.use(bodyParser.json());

// Baileys Logic
let sock;
let currentQR = null; // Store the latest QR code string

// Admin Endpoint to get QR Code
app.get('/api/admin/qr', (req, res) => {
    const { password } = req.query;
    if (password === 'yusufhair') {
        res.json({ success: true, qr: currentQR, connected: !currentQR });
    } else {
        res.status(403).json({ success: false, message: 'Unauthorized' });
    }
});

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    sock = makeWASocket({
        auth: state,
        printQRInTerminal: true, // Baileys handles QR printing natively via logs
        logger: pino({ level: 'silent' }), // Hide noisy logs
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            currentQR = qr; // Capture the QR string
            console.log('\n\n===================================================');
            console.log('LÜTFEN AŞAĞIDAKİ QR KODU WHATSAPP İLE TARATIN (BAILEYS):');
            qrcode.generate(qr, { small: true });
            console.log('===================================================\n');
        }

        if (update.connection === 'close') {
            console.log('Bağlantı kapandı, yeniden bağlanılıyor...', (update.lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut);
            if ((update.lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut) {
                connectToWhatsApp();
            }
        } else if (update.connection === 'open') {
            currentQR = null;
            console.log('✅ WhatsApp Bağlantısı BAŞARILI!');
            console.log(`Hazır! Mesajlar otomatik olarak ${OWNER_PHONE} numarasına gidecek.`);

            // Keepalive mechanism: ping every 5 seconds to keep connection alive
            if (global.keepAliveInterval) {
                clearInterval(global.keepAliveInterval);
            }

            global.keepAliveInterval = setInterval(async () => {
                try {
                    if (sock && sock.user) {
                        await sock.sendPresenceUpdate('available');
                        console.log('[Keepalive] WhatsApp bağlantısı aktif');
                    }
                } catch (err) {
                    console.log('[Keepalive] Ping hatası:', err.message);
                }
            }, 5000);
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message) return;

        const sender = msg.key.remoteJid;
        console.log(`[Msg] Upsert Type: ${m.type}`);
        console.log(`[Msg] From: ${sender}, fromMe: ${msg.key.fromMe}`);
        if (msg.message?.extendedTextMessage || msg.message?.conversation) {
            console.log(JSON.stringify(msg, null, 2));
        }

        // Check if message is from ME (the owner) or from the Owner's phone
        // We must check remoteJidAlt because Baileys sometimes returns the LID (Linked Device ID) for the owner
        const isFromOwner = (
            sender === OWNER_PHONE ||
            msg.key.fromMe ||
            (msg.key.remoteJidAlt && msg.key.remoteJidAlt === OWNER_PHONE)
        );

        console.log(`[Auth] Is Owner? ${isFromOwner} (Sender: ${sender}, Alt: ${msg.key.remoteJidAlt})`);

        if (isFromOwner) {
            // Get text content (conversation or extendedTextMessage)
            const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

            if (text) { // Any text reply to a card is now processed
                // Check quoted message
                const contextInfo = msg.message.extendedTextMessage?.contextInfo;
                if (contextInfo && contextInfo.quotedMessage) {
                    const quotedCaption = contextInfo.quotedMessage.imageMessage?.caption;

                    if (quotedCaption && quotedCaption.includes('İletişim:')) {
                        console.log(`[WhatsApp Auto] Bir karta cevap verildi: "${text}"`);

                        // Extract phone number
                        const match = quotedCaption.match(/İletişim:\s*(\d+)/);
                        if (match && match[1]) {
                            let customerPhone = match[1].replace(/\D/g, '');
                            if (customerPhone.startsWith('0')) customerPhone = customerPhone.substring(1);
                            if (!customerPhone.startsWith('90')) customerPhone = '90' + customerPhone;
                            const customerJid = customerPhone + '@s.whatsapp.net';

                            // Determine Cancellation Reason
                            const keywords = ['RED', 'RET', 'İPTAL', 'IPTAL', 'CANCEL'];
                            const isStandardCancel = keywords.includes(text.toUpperCase().trim());

                            let rejectionReason = "Yoğunluk nedeniyle randevunuz onaylanamamıştır."; // Default
                            if (!isStandardCancel) {
                                rejectionReason = text; // Use the custom reply as reason
                            }

                            // --- SLOT RELEASE LOGIC ---
                            try {
                                const currentDb = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
                                const appIndex = currentDb.appointments.findIndex(app => {
                                    const appPhoneClean = app.customerPhone.replace(/\D/g, '').slice(-10);
                                    const targetPhoneClean = customerPhone.replace(/\D/g, '').slice(-10);
                                    return appPhoneClean === targetPhoneClean;
                                });

                                if (appIndex !== -1) {
                                    const removed = currentDb.appointments.splice(appIndex, 1)[0];
                                    fs.writeFileSync(DB_FILE, JSON.stringify(currentDb, null, 2));

                                    // Generate Cancellation Card
                                    let cancelCard;
                                    try {
                                        const service = currentDb.services.find(s => s.id === Number(removed.serviceId));
                                        const serviceName = service ? service.name : 'Hizmet';
                                        cancelCard = createCancellationCard({
                                            customerName: removed.customerName,
                                            date: removed.date,
                                            time: removed.time,
                                            reservationCode: removed.reservationCode
                                        }, serviceName);
                                    } catch (e) { console.error('Card gen error', e); }

                                    // 1. Notify Customer
                                    if (cancelCard) {
                                        await sock.sendMessage(customerJid, {
                                            image: cancelCard,
                                            caption: `❌ Sayın ${removed.customerName}, randevunuz iptal edilmiştir.\n\n🛑 *Sebep:* ${rejectionReason}\n\nLütfen iletişime geçiniz: +90 551 063 02 20`
                                        });
                                    } else {
                                        await sock.sendMessage(customerJid, {
                                            text: `❌ Sayın ${removed.customerName}, randevunuz iptal edilmiştir.\n🛑 Sebep: ${rejectionReason}`
                                        });
                                    }

                                    // 2. Notify Owner (Visual Confirmation)
                                    const ownerMsg = `✅ İşlem Başarılı.\nRandevu silindi ve müşteriye bildirim yapıldı.\n\n*İletilen Sebep:* ${rejectionReason}`;
                                    if (cancelCard) {
                                        await sock.sendMessage(sender, {
                                            image: cancelCard, // Send the card to owner too
                                            caption: ownerMsg
                                        });
                                    } else {
                                        await sock.sendMessage(sender, { text: ownerMsg });
                                    }

                                } else {
                                    await sock.sendMessage(sender, { text: `⚠️ Hata: Randevu veritabanında bulunamadı (Zaten silinmiş olabilir).` });
                                }
                            } catch (err) {
                                console.error('[WhatsApp Auto] İşlem hatası:', err);
                                await sock.sendMessage(sender, { text: '❌ İşlem sırasında sunucu hatası.' });
                            }

                        } else {
                            console.log("Quoted message is not a card");
                        }
                    }
                }
            }
        });

    sock.ev.on('creds.update', saveCreds);
}

// Helper to read DB
const readDb = () => {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading DB:", err);
        return { services: [], appointments: [] };
    }
};

// Helper to write DB
const writeDb = (data) => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error("Error writing DB:", err);
        return false;
    }
};

// Routes
// 1. Get Services
app.get('/api/services', (req, res) => {
    const db = readDb();
    res.json(db.services);
});

// 2. Get Available Slots
app.get('/api/slots', (req, res) => {
    const { date } = req.query; // YYYY-MM-DD
    if (!date) return res.status(400).json({ error: 'Date is required' });

    const db = readDb();
    const settings = db.settings;
    const dayAppointments = db.appointments.filter(appt => appt.date === date);

    const slots = [];
    let currentTime = settings.startHour * 60; // in minutes
    const endTime = settings.endHour * 60;

    while (currentTime < endTime) {
        const hour = Math.floor(currentTime / 60);
        const minute = currentTime % 60;
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        // Check availability
        const isTaken = dayAppointments.some(appt => appt.time === timeString);

        if (!isTaken) {
            slots.push(timeString);
        }

        currentTime += settings.timeInterval;
    }

    res.json(slots);
});

// 3. Create Appointment
app.post('/api/appointments', async (req, res) => {
    // New payload: services: [{ serviceId, count }]
    const { customerName, customerPhone, services, date, time } = req.body;

    if (!customerName || !customerPhone || !services || services.length === 0 || !date || !time) {
        return res.status(400).json({ error: 'Tüm alanlar ve en az bir hizmet seçilmelidir.' });
    }

    const db = readDb();

    // Check Slot Availability (Simple check: is there ANY appointment at this time?)
    // Improvement: We might want to sum durations, but user asked for "2 people" logic.
    // For now, if the slot is taken, we reject.
    const isSlotTaken = db.appointments.some(a => a.date === date && a.time === time);
    if (isSlotTaken) {
        return res.status(400).json({ error: 'Seçilen saat doludur. Lütfen başka bir saat seçiniz.' });
    }

    // Reservation Code: YT + 2 Digits + 2 Letters (e.g. YT42XB)
    const randomDigits = Math.floor(Math.random() * 90 + 10); // 10-99
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const randomLetters = letters.charAt(Math.floor(Math.random() * letters.length)) +
        letters.charAt(Math.floor(Math.random() * letters.length));
    const reservationCode = `YT${randomDigits}${randomLetters}`;

    // Resolve Service Names for Card
    let serviceNames = [];
    let totalPrice = 0;

    // Validate services and build summary
    const resolvedServices = services.map(item => {
        const srv = db.services.find(s => s.id === Number(item.serviceId));
        if (srv) {
            serviceNames.push(`${srv.name} (${item.count})`);
            totalPrice += srv.price * item.count;
            return { ...item, name: srv.name, price: srv.price };
        }
        return item;
    });

    const displayServiceName = serviceNames.join(', '); // "Saç Kesimi (1), Sakal (1)"

    const newAppointment = {
        id: Date.now(),
        customerName,
        customerPhone,
        services: resolvedServices, // Store full array
        // Keep serviceId for compatibility if needed, or just first one
        serviceId: resolvedServices[0]?.serviceId,
        date,
        time,
        reservationCode,
        totalPrice,
        createdAt: new Date().toISOString()
    };

    db.appointments.push(newAppointment);
    writeDb(db);

    const { createAdminCard, createCustomerCard, createCancellationCard, createReviewCard, createReviewResultCard } = require('./cardGenerator.cjs');

    // Generate Appointment Cards
    let ownerImageBuffer;
    let customerImageBuffer;

    try {
        // 1. Owner Card (Admin Dark)
        ownerImageBuffer = createAdminCard({
            customerName,
            customerPhone,
            date,
            time,
            reservationCode
        }, displayServiceName); // Pass combined string

        // 2. Customer Card (White Invite)
        customerImageBuffer = createCustomerCard({
            customerName,
            customerPhone,
            date,
            time,
            reservationCode
        }, displayServiceName); // Pass combined string

    } catch (err) {
        console.error("Image generation failed:", err);
    }

    // ... Send messages (code handling below remains similar)

    // Helper: Wait for connection to be ready
    const waitForConnection = (timeout = 5000) => {
        return new Promise((resolve, reject) => {
            if (!sock) return reject('Socket not initialized');

            // Check if already connected
            if (sock.user) return resolve(true);

            const timeoutId = setTimeout(() => {
                reject('Connection timeout');
            }, timeout);

            // Wait for next connection.update
            const checkConnection = (update) => {
                if (update.connection === 'open' && sock.user) {
                    clearTimeout(timeoutId);
                    sock.ev.off('connection.update', checkConnection);
                    resolve(true);
                }
            };
            sock.ev.on('connection.update', checkConnection);
        });
    };

    // Send Automatic WhatsApp Messages
    try {
        // Wait for stable connection before sending
        await waitForConnection().catch(err => {
            console.log('[WhatsApp Auto] Bağlantı bekleniyor, mesaj kuyruğa alınıyor...');
            throw new Error('WhatsApp bağlantısı hazır değil. Lütfen birkaç saniye sonra tekrar deneyin.');
        });

        if (sock && sock.user) {
            // A. Send to OWNER (Admin Card or Fallback Text)
            if (ownerImageBuffer) {
                await sock.sendMessage(OWNER_PHONE, {
                    image: ownerImageBuffer,
                    caption: `📞 İletişim: ${customerPhone}\n🔑 Kod: ${reservationCode}\n\n${displayServiceName}`
                });
                console.log(`[WhatsApp Auto] Yöneticiye Admin Kartı gönderildi.`);
            } else {
                // Fallback Text
                await sock.sendMessage(OWNER_PHONE, {
                    text: `⚠️ YENİ RANDEVU (Kartsız)\n\n👤 ${customerName}\n📞 ${customerPhone}\n📅 ${date} ⏰ ${time}\n✂️ ${displayServiceName}\n🔑 Kod: ${reservationCode}`
                });
                console.log(`[WhatsApp Auto] Yöneticiye TEXT (Fallback) gönderildi.`);
            }

            // B. Send to CUSTOMER (Customer Card or Fallback Text)
            let targetPhone = customerPhone.replace(/\D/g, '');
            if (targetPhone.startsWith('0')) targetPhone = targetPhone.substring(1);
            if (!targetPhone.startsWith('90')) targetPhone = '90' + targetPhone;
            const customerJid = targetPhone + '@s.whatsapp.net';

            // Correct link for Hash Router
            const reviewLink = `https://yusuftanikhairdesigner.com/#/review?code=${reservationCode}`;
            const baseCaption = `🎉 Sayın ${customerName}, randevunuz başarıyla oluşturulmuştur.\n\n📅 ${date} - ${time}\n✂️ ${displayServiceName}\n\nKeyifli bir deneyim için sizi bekliyoruz.\n\n⭐ Değerlendirme: ${reviewLink}\n📍 Konum: https://yusuftanikhairdesigner.com\n📞 İletişim: +90 551 063 02 20`;

            if (customerImageBuffer) {
                await sock.sendMessage(customerJid, {
                    image: customerImageBuffer,
                    caption: baseCaption
                });
                console.log(`[WhatsApp Auto] Müşteriye Davetiye Kartı gönderildi.`);
            } else {
                await sock.sendMessage(customerJid, {
                    text: baseCaption
                });
                console.log(`[WhatsApp Auto] Müşteriye TEXT (Fallback) gönderildi.`);
            }
        } else {
            console.log('[WhatsApp Auto] Socket bağlı değil, mesaj gönderilemedi.');
        }
    } catch (err) {
        console.error('[WhatsApp Auto] Mesaj hatası:', err);
        // Don't throw error to frontend - appointment is still saved
    }

    res.status(201).json({
        message: 'Appointment created successfully',
        appointment: newAppointment
    });
});

// 4. Submit Review
app.post('/api/reviews', async (req, res) => {
    const { name, code, rating, comment } = req.body;

    if (!name || !code || !rating || !comment) {
        return res.status(400).json({ error: 'Tüm alanlar zorunludur.' });
    }

    const db = readDb();

    // Validate Code (Check active or past appointments)
    const appt = db.appointments.find(a => a.reservationCode === code);
    if (!appt) {
        return res.status(404).json({ error: 'Geçersiz veya bulunamayan rezervasyon kodu.' });
    }

    const newReview = {
        id: Date.now(),
        appointmentId: appt.id,
        customerName: name,
        rating: Number(rating),
        comment,
        date: new Date().toLocaleDateString('tr-TR'),
        createdAt: new Date().toISOString()
    };

    db.reviews.push(newReview);
    writeDb(db);

    // Notify Owner with Disappearing Card (48 Hours)
    try {
        if (sock) {
            const reviewCard = createReviewResultCard(newReview);

            await sock.sendMessage(OWNER_PHONE, {
                image: reviewCard,
                caption: `⭐ YENİ YORUM GELDİ!\n\nDeğerlendiren: ${name}\nPuan: ${rating}/5\nKod: ${code}`
            }, {
                ephemeralExpiration: 48 * 60 * 60 // 48 Hours (Self-destruct)
            });
            console.log('[WhatsApp Auto] Yorum kartı yöneticiye gönderildi (Image + 48 Hours Ephemeral).');
        }
    } catch (err) {
        console.error('Yorum bildirimi hatası:', err);
    }

    res.status(201).json({ message: 'Yorumunuz kaydedildi.' });
});

// 6. Get Appointment Details (For Review Page Auto-fill)
app.get('/api/appointment-details/:code', (req, res) => {
    const { code } = req.params;
    const db = readDb();
    const appt = db.appointments.find(a => a.reservationCode === code);

    if (appt) {
        res.json({ success: true, customerName: appt.customerName });
    } else {
        res.status(404).json({ error: 'Kod bulunamadı' });
    }
    if (appt) {
        res.json({ success: true, customerName: appt.customerName });
    } else {
        res.status(404).json({ error: 'Kod bulunamadı' });
    }
});

// 7. Get Reviews (For Home Page)
app.get('/api/reviews', (req, res) => {
    const db = readDb();
    // Return only 4-5 star reviews, sorted by newest
    const approvedReviews = db.reviews
        .filter(r => r.rating >= 4)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(approvedReviews);
});

// Start Server & Connect WhatsApp
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    connectToWhatsApp();
});

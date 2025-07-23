const { app, BrowserWindow, Menu, safeStorage } = require('electron'); // safeStorage eklendi
const path = require('path');
const isDev = require('electron-is-dev');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const { readData } = require('./src/file-system-handler');
const { notVeriYolu, firmaVeriYolu, veriKlasoru } = require('./src/constants');
const { initializeAppDirectories } = require('./src/file-system-handler');
const { registerIpcHandlers } = require('./src/ipc-handlers/index.js');

let mainWindow;

// --- E-POSTA GÖNDERME FONKSİYONU ---
async function sendReminderEmail(hatirlatmalar) {
    if (hatirlatmalar.length === 0) {
        console.log('Bugün için hatırlatılacak not bulunamadı.');
        return;
    }

    const ayarlarYolu = path.join(veriKlasoru, 'ayarlar.json');
    const ayarlar = readData(ayarlarYolu);

    if (!ayarlar.host || !ayarlar.user || !ayarlar.pass || !ayarlar.to) {
        console.log('E-posta ayarları yapılmamış. Hatırlatma gönderilemedi.');
        return;
    }
    
    try {
        // Şifreyi güvenli depolamadan çöz
        const base64Buffer = Buffer.from(ayarlar.pass, 'base64');
        const cozulmusParola = safeStorage.decryptString(base64Buffer);

        let transporter = nodemailer.createTransport({
            host: ayarlar.host,
            port: parseInt(ayarlar.port, 10),
            secure: parseInt(ayarlar.port, 10) === 465, // Port 465 ise SSL kullan
            auth: {
                user: ayarlar.user,
                pass: cozulmusParola,
            },
        });

        let emailBody = '<h1>Bugünkü Hatırlatmalarınız</h1><ul>';
        
        hatirlatmalar.forEach(hatirlatma => {
            // Not içeriğindeki HTML etiketlerini temizleyerek daha okunabilir bir metin oluştur
            const icerikMetni = hatirlatma.icerik.replace(/<[^>]*>/g, '').substring(0, 150);
            emailBody += `<li><b>${hatirlatma.baslik} (${hatirlatma.donem})</b>: Son tarih bugün!<br><small>İlgili Not: ${icerikMetni}...</small></li>`;
        });
        emailBody += '</ul>';
        
        let info = await transporter.sendMail({
            from: `"Firma Not Defteri" <${ayarlar.user}>`,
            to: ayarlar.to,
            subject: 'Günlük Not Hatırlatmaları',
            html: emailBody,
        });

        console.log('Hatırlatma e-postası gönderildi: %s', info.messageId);
    } catch (error) {
        console.error('E-posta gönderilirken hata oluştu:', error);
    }
}

// --- ZAMANLANMIŞ GÖREV ---
// Her sabah saat 9:00'da çalışır ('0 9 * * *').
cron.schedule('0 9 * * *', () => {
    console.log('Günlük hatırlatıcılar kontrol ediliyor...');
    const notlar = readData(notVeriYolu);
    const firmalar = readData(firmaVeriYolu);
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD formatı

    const bugununHatirlatmalari = [];

    notlar.forEach(not => {
        if (Array.isArray(not.notIcerik)) {
            not.notIcerik.forEach(blok => {
                if (blok.sonTarih === today) {
                    const firma = firmalar.find(f => f.id === not.firmaId);
                    const baslik = firma ? `${firma.unvan} / ${not.tur}` : `Kişisel Not / ${not.tur}`;
                    bugununHatirlatmalari.push({
                        baslik: baslik,
                        donem: not.donem,
                        icerik: blok.content
                    });
                }
            });
        }
    });
    
    if (bugununHatirlatmalari.length > 0) {
        sendReminderEmail(bugununHatirlatmalari);
    }
}, {
    timezone: "Europe/Istanbul"
});

const menuTemplate = [
    {
        label: 'Dosya',
        submenu: [
            {
                label: 'Yeni Not',
                accelerator: 'CmdOrCtrl+N',
                click: () => {
                    mainWindow.webContents.send('menu-yeni-not');
                }
            },
            {
                label: 'Notu Kaydet',
                accelerator: 'CmdOrCtrl+S',
                click: () => {
                    mainWindow.webContents.send('menu-not-kaydet');
                }
            },
            { type: 'separator' },
            { role: 'quit', label: 'Çıkış' }
        ]
    },
    {
        label: 'Görünüm',
        submenu: [
            { role: 'reload', label: 'Yenile' },
            { role: 'forceReload', label: 'Yenilemeyi Zorla' },
            { role: 'toggleDevTools', label: 'Geliştirici Araçları' },
        ]
    }
];

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true, 
            nodeIntegration: false
        }
    });

    const startUrl = isDev
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, '../build/index.html')}`;

    mainWindow.loadURL(startUrl);
}

app.whenReady().then(() => {
    initializeAppDirectories();
    registerIpcHandlers();
    createWindow();

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
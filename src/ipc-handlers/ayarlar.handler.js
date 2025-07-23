const { ipcMain, dialog, safeStorage } = require('electron');
const { readData, writeData } = require('../file-system-handler');
const { veriKlasoru } = require('../constants');
const nodemailer = require('nodemailer');
const path = require('path');

const ayarlarVeriYolu = path.join(veriKlasoru, 'ayarlar.json');

// Ayarlar dosyasının var olup olmadığını kontrol et ve gerekirse oluştur
function ensureAyarlarFile() {
    try {
        if (!readData(ayarlarVeriYolu).host) {
            writeData(ayarlarVeriYolu, {});
        }
    } catch (e) {
        writeData(ayarlarVeriYolu, {});
    }
}

function registerAyarlarHandlers() {
    ensureAyarlarFile();

    // Ayarları kaydeder (şifreyi şifreleyerek)
    ipcMain.handle('ayarlari-kaydet', (event, ayarlar) => {
        try {
            const mevcutAyarlar = readData(ayarlarVeriYolu);
            const yeniAyarlar = {
                host: ayarlar.host,
                port: ayarlar.port,
                user: ayarlar.user,
                to: ayarlar.to,
            };

            // Sadece yeni bir şifre girildiyse şifrele ve kaydet
            if (ayarlar.pass && ayarlar.pass.trim() !== '') {
                const sifrelenmisParola = safeStorage.encryptString(ayarlar.pass);
                yeniAyarlar.pass = sifrelenmisParola.toString('base64'); // Buffer'ı string olarak sakla
            } else {
                // Yeni şifre girilmediyse eskisini koru
                yeniAyarlar.pass = mevcutAyarlar.pass;
            }

            writeData(ayarlarVeriYolu, yeniAyarlar);
            return { success: true, message: 'Ayarlar başarıyla kaydedildi.' };
        } catch (error) {
            console.error('Ayarları kaydetme hatası:', error);
            return { success: false, message: `Bir hata oluştu: ${error.message}` };
        }
    });

    // Ayarları getirir (şifre hariç)
    ipcMain.handle('ayarlari-getir', () => {
        const ayarlar = readData(ayarlarVeriYolu);
        // Güvenlik için şifreyi asla renderer process'e gönderme
        return {
            host: ayarlar.host || '',
            port: ayarlar.port || '',
            user: ayarlar.user || '',
            to: ayarlar.to || '',
            isPassSet: !!ayarlar.pass, // Sadece şifrenin ayarlı olup olmadığı bilgisini gönder
        };
    });

    // E-posta ayarlarını test eder
    ipcMain.handle('test-email-gonder', async () => {
        const ayarlar = readData(ayarlarVeriYolu);
        if (!ayarlar.host || !ayarlar.user || !ayarlar.pass || !ayarlar.to) {
            return { success: false, message: 'Lütfen tüm e-posta ayarlarını yapın.' };
        }

        try {
            const base64Buffer = Buffer.from(ayarlar.pass, 'base64');
            const cozulmusParola = safeStorage.decryptString(base64Buffer);

            const transporter = nodemailer.createTransport({
                host: ayarlar.host,
                port: ayarlar.port,
                secure: parseInt(ayarlar.port, 10) === 465,
                auth: {
                    user: ayarlar.user,
                    pass: cozulmusParola,
                },
            });

            await transporter.verify(); // Bağlantıyı doğrula

            await transporter.sendMail({
                from: `"Firma Not Defteri Test" <${ayarlar.user}>`,
                to: ayarlar.to,
                subject: 'E-posta Ayarları Testi Başarılı ✔',
                text: 'E-posta ayarlarınız doğru bir şekilde yapılandırıldı.',
            });

            return { success: true, message: 'Test e-postası başarıyla gönderildi!' };
        } catch (error) {
            console.error('Test e-postası hatası:', error);
            return { success: false, message: `E-posta gönderilemedi: ${error.message}` };
        }
    });
}

module.exports = { registerAyarlarHandlers };
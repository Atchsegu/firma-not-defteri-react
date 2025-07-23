// src/file-system-handler.js

const fs = require('fs');
const {
    veriKlasoru,
    belgelerKlasoru,
    firmaVeriYolu,
    notVeriYolu,
    belgeVeriYolu,
    kisiVeriYolu,
    etiketVeriYolu // YENİ EKLENDİ
} = require('./constants');

/**
 * Belirtilen yolda dosya yoksa, varsayılan içerikle oluşturur.
 * @param {string} filePath - Dosya yolu
 * @param {string} defaultContent - Varsayılan içerik
 */
function ensureFileExists(filePath, defaultContent = '[]') {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, defaultContent, 'utf-8');
    }
}

/**
 * Uygulamanın ihtiyaç duyduğu ana klasörleri ve veri dosyalarını oluşturur/kontrol eder.
 */
function initializeAppDirectories() {
    if (!fs.existsSync(veriKlasoru)) fs.mkdirSync(veriKlasoru, { recursive: true });
    if (!fs.existsSync(belgelerKlasoru)) fs.mkdirSync(belgelerKlasoru, { recursive: true });

    ensureFileExists(firmaVeriYolu);
    ensureFileExists(notVeriYolu);
    ensureFileExists(belgeVeriYolu);
    ensureFileExists(etiketVeriYolu); // YENİ EKLENDİ
    ensureFileExists(kisiVeriYolu, JSON.stringify([
        { "id": 1, "adSoyad": "Ali Veli" },
        { "id": 2, "adSoyad": "Ayşe Yılmaz" }
    ], null, 2));
}

/**
 * JSON verisini dosyadan okur.
 * @param {string} yol - Okunacak dosyanın yolu
 * @returns {Array | object} - Okunan ve parse edilen JSON verisi
 */
function readData(yol) {
    try {
        const rawData = fs.readFileSync(yol, 'utf-8');
        return rawData.length > 0 ? JSON.parse(rawData) : [];
    } catch (error) {
        console.error(`HATA: Veri okunamadı: ${yol}`, error);
        return [];
    }
}

/**
 * Veriyi JSON formatında dosyaya yazar.
 * @param {string} yol - Yazılacak dosyanın yolu
 * @param {Array | object} data - Yazılacak veri
 */
function writeData(yol, data) {
    try {
        fs.writeFileSync(yol, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error(`HATA: Veri yazılamadı: ${yol}`, error);
    }
}

module.exports = {
    initializeAppDirectories,
    readData,
    writeData
};
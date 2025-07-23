// src/constants.js

const { app } = require('electron');
const path = require('path');

// Ana uygulama klasörünün OneDrive veya kullanıcı ana dizininde bulunması
const oneDrivePath = process.env.ONEDRIVE || app.getPath('home');
const uygulamaAnaKlasoru = path.join(oneDrivePath, 'Uygulamalarım', 'Muhasebeci Not Defteri');

// Alt klasörler
const veriKlasoru = path.join(uygulamaAnaKlasoru, 'Veri');
const belgelerKlasoru = path.join(uygulamaAnaKlasoru, 'Belgeler');

// Veri dosyalarının tam yolları
const firmaVeriYolu = path.join(veriKlasoru, 'firmalar.json');
const notVeriYolu = path.join(veriKlasoru, 'notlar.json');
const belgeVeriYolu = path.join(veriKlasoru, 'belgeler.json');
const kisiVeriYolu = path.join(veriKlasoru, 'kisiler.json');
const etiketVeriYolu = path.join(veriKlasoru, 'etiketler.json'); // YENİ EKLENDİ

module.exports = {
    uygulamaAnaKlasoru,
    veriKlasoru,
    belgelerKlasoru,
    firmaVeriYolu,
    notVeriYolu,
    belgeVeriYolu,
    kisiVeriYolu,
    etiketVeriYolu // YENİ EKLENDİ
};
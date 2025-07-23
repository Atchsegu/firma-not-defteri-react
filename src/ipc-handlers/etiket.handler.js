const { ipcMain } = require('electron');
const { readData, writeData } = require('../file-system-handler');
const { etiketVeriYolu } = require('../constants');

function registerEtiketHandlers() {
    // Tüm etiketleri getirir
    ipcMain.handle('etiketleri-getir', () => {
        return readData(etiketVeriYolu);
    });

    // Yeni etiketleri merkezi listeye ekler (tekrarları önler)
    ipcMain.on('etiket-ekle', (event, yeniEtiketler) => {
        if (!yeniEtiketler || yeniEtiketler.length === 0) return;

        const mevcutEtiketler = readData(etiketVeriYolu);
        let guncellemeYapildi = false;

        yeniEtiketler.forEach(yeniEtiket => {
            // Etiketin zaten var olup olmadığını kontrol et (büyük/küçük harf duyarsız)
            const etiketVar = mevcutEtiketler.some(mevcut => mevcut.toLowerCase() === yeniEtiket.toLowerCase());
            if (!etiketVar) {
                mevcutEtiketler.push(yeniEtiket);
                guncellemeYapildi = true;
            }
        });

        if (guncellemeYapildi) {
            writeData(etiketVeriYolu, mevcutEtiketler.sort()); // Alfabetik olarak sırala
        }
    });
}

module.exports = { registerEtiketHandlers };
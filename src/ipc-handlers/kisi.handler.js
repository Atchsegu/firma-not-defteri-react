const { ipcMain, BrowserWindow } = require('electron');
const { readData, writeData } = require('../file-system-handler');
const { kisiVeriYolu } = require('../constants');

function registerKisiHandlers() {
    ipcMain.handle('kisileri-getir', () => readData(kisiVeriYolu));

    ipcMain.on('yeni-kisi-ekle', (event, adSoyad) => {
        const kisiler = readData(kisiVeriYolu);
        const yeniKisi = { id: Date.now(), adSoyad: adSoyad };
        kisiler.push(yeniKisi);
        writeData(kisiVeriYolu, kisiler);
        BrowserWindow.getAllWindows().forEach(win => win.webContents.send('kisiler-guncellendi', kisiler));
    });

    ipcMain.handle('kisi-sil', (event, kisiId) => {
        const kisiler = readData(kisiVeriYolu);
        const guncelKisiler = kisiler.filter(k => k.id !== kisiId);
        writeData(kisiVeriYolu, guncelKisiler);
        BrowserWindow.getAllWindows().forEach(win => win.webContents.send('kisiler-guncellendi', guncelKisiler));
        return { success: true };
    });
}

module.exports = { registerKisiHandlers };
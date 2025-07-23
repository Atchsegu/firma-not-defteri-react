const { ipcMain, BrowserWindow } = require('electron');
const { readData, writeData } = require('../file-system-handler');
const { firmaVeriYolu, notVeriYolu } = require('../constants');

// Bu fonksiyon, tüm pencerelere güncel firma listesini gönderir.
function broadcastFirmaListesi() {
    const firmalar = readData(firmaVeriYolu);
    BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('firmalar-guncellendi', firmalar);
    });
}

function registerFirmaHandlers() {
    ipcMain.handle('firmalari-getir', () => {
        return readData(firmaVeriYolu);
    });

    ipcMain.on('yeni-firma', (event, firmaData) => {
        const firmalar = readData(firmaVeriYolu);
        firmaData.id = Date.now();
        firmaData.tags = firmaData.tags || []; // Etiket dizisini başlat
        firmalar.push(firmaData);
        writeData(firmaVeriYolu, firmalar);
        
        // Yeni etiketleri merkezi listeye eklemesi için olayı tetikle
        if (firmaData.tags.length > 0) {
            event.sender.send('etiket-ekle-event', firmaData.tags);
        }

        broadcastFirmaListesi();
    });

    ipcMain.handle('firma-sil', (event, firmaId) => {
        const notlar = readData(notVeriYolu);
        if (notlar.some(n => n.firmaId === firmaId)) {
            return { success: false, message: 'Bu firmanın not kayıtları var. Önce notları silmelisiniz.' };
        }
        let firmalar = readData(firmaVeriYolu);
        firmalar = firmalar.filter(f => f.id !== firmaId);
        writeData(firmaVeriYolu, firmalar);
        broadcastFirmaListesi();
        return { success: true, message: 'Firma başarıyla silindi.' };
    });

    ipcMain.handle('firma-guncelle', (event, firmaData) => {
        try {
            const firmalar = readData(firmaVeriYolu);
            const firmaIndex = firmalar.findIndex(f => f.id === firmaData.id);
            if (firmaIndex !== -1) {
                // Gelen veride tags alanı varsa, onu kullan; yoksa eskisini koru
                const guncelFirma = { 
                    ...firmalar[firmaIndex], 
                    ...firmaData,
                    tags: firmaData.tags !== undefined ? firmaData.tags : firmalar[firmaIndex].tags
                };
                firmalar[firmaIndex] = guncelFirma;
                writeData(firmaVeriYolu, firmalar);

                // Yeni etiketleri merkezi listeye eklemesi için olayı tetikle
                if (guncelFirma.tags && guncelFirma.tags.length > 0) {
                    event.sender.send('etiket-ekle-event', guncelFirma.tags);
                }

                broadcastFirmaListesi(); 
                return { success: true, message: 'Firma bilgileri başarıyla güncellendi.', guncellenenFirma: firmalar[firmaIndex] };
            }
            return { success: false, message: 'Güncellenecek firma bulunamadı.' };
        } catch (error) {
            console.error('HATA: Firma güncellenirken hata:', error);
            return { success: false, message: 'Firma güncellenirken bir hata oluştu.' };
        }
    });
}

module.exports = { registerFirmaHandlers };
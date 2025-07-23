const { ipcMain } = require('electron');
const { readData, writeData } = require('../file-system-handler');
const { notVeriYolu, belgeVeriYolu, belgelerKlasoru, uygulamaAnaKlasoru } = require('../constants');
const fs = require('fs');
const path = require('path');

function registerNotHandlers() {
    ipcMain.handle('notlari-getir', (event, firmaId) => readData(notVeriYolu).filter(n => n.firmaId === firmaId));
    
    ipcMain.handle('kisisel-notlari-getir', () => {
        return readData(notVeriYolu).filter(n => !n.firmaId);
    });

    ipcMain.on('yeni-not', (event, notData) => {
        const notlar = readData(notVeriYolu);
        notData.id = Date.now();
        notData.notIcerik = []; 
        notData.tags = notData.tags || [];
        notData.sonTarih = notData.sonTarih || null; // YENİ EKLENDİ
        notlar.push(notData);
        writeData(notVeriYolu, notlar);

        const allTags = [...(notData.tags || [])];
        if (allTags.length > 0) {
            event.sender.send('etiket-ekle-event', allTags);
        }

        if(notData.firmaId) {
            event.sender.send('notlar-guncellendi', readData(notVeriYolu).filter(n => n.firmaId === notData.firmaId));
        } else {
            event.sender.send('notlar-guncellendi', readData(notVeriYolu).filter(n => !n.firmaId));
        }
    });

    ipcMain.handle('get-not-detay', (event, notId) => {
        const not = readData(notVeriYolu).find(n => n.id === notId);
        // Eski string yapısını yeni dizi yapısına dönüştür (geçiş için)
        if (not && typeof not.notIcerik === 'string') {
            not.notIcerik = [{ id: Date.now(), content: not.notIcerik, tags: [] }];
        }
        return {
            not,
            belgeler: readData(belgeVeriYolu).filter(b => b.notId === notId)
        };
    });

    ipcMain.handle('not-icerik-kaydet', (event, { notId, icerikBloklari }) => {
        try {
            const notlar = readData(notVeriYolu);
            const notIndex = notlar.findIndex(n => n.id === notId);
            if (notIndex !== -1) {
                // Her blok için etiketleri merkezi listeye gönder
                const allBlockTags = icerikBloklari.flatMap(blok => blok.tags || []);
                if (allBlockTags.length > 0) {
                    event.sender.send('etiket-ekle-event', [...new Set(allBlockTags)]); // Tekrarları kaldır
                }

                notlar[notIndex].notIcerik = icerikBloklari;
                writeData(notVeriYolu, notlar);
                return { success: true, message: 'Notlar başarıyla kaydedildi.' };
            }
            return { success: false, message: 'İlgili not kaydı bulunamadı.' };
        } catch (error) {
            console.error('HATA: Notlar kaydedilirken hata:', error);
            return { success: false, message: 'Notlar kaydedilirken bir hata oluştu.' };
        }
    });

    ipcMain.handle('not-sil', (event, notId) => {
        const notlar = readData(notVeriYolu);
        const guncelNotlar = notlar.filter(n => n.id !== notId);
        writeData(notVeriYolu, guncelNotlar);

        const belgeler = readData(belgeVeriYolu);
        const silinecekBelgeler = belgeler.filter(b => b.notId === notId);
        
        for (const belge of silinecekBelgeler) {
            const mutlakYol = path.join(uygulamaAnaKlasoru, belge.dosyaYolu);
            if (fs.existsSync(mutlakYol)) fs.unlinkSync(mutlakYol);
        }
        
        const kalanBelgeler = belgeler.filter(b => b.notId !== notId);
        writeData(belgeVeriYolu, kalanBelgeler);
        const belgeKlasoru = path.join(belgelerKlasoru, notId.toString());
        if (fs.existsSync(belgeKlasoru)) fs.rmSync(belgeKlasoru, { recursive: true, force: true });

        return { success: true };
    });

    ipcMain.handle('not-guncelle', (event, notData) => {
        const notlar = readData(notVeriYolu);
        const notIndex = notlar.findIndex(n => n.id === notData.id);
        if (notIndex !== -1) {
            const guncelNot = { 
                ...notlar[notIndex], 
                ...notData,
                tags: notData.tags !== undefined ? notData.tags : notlar[notIndex].tags,
                sonTarih: notData.sonTarih !== undefined ? notData.sonTarih : notlar[notIndex].sonTarih // YENİ EKLENDİ
            };
            notlar[notIndex] = guncelNot;
            writeData(notVeriYolu, notlar);

            if (guncelNot.tags && guncelNot.tags.length > 0) {
                event.sender.send('etiket-ekle-event', guncelNot.tags);
            }

            return { success: true };
        }
        return { success: false, message: 'Güncellenecek not bulunamadı.' };
    });
}

module.exports = { registerNotHandlers };
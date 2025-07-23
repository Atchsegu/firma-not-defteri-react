const { ipcMain, dialog, shell } = require('electron');
const { readData, writeData } = require('../file-system-handler');
const { uygulamaAnaKlasoru, belgelerKlasoru, belgeVeriYolu, notVeriYolu } = require('../constants');
const fs = require('fs');
const path = require('path');

function registerBelgeHandlers() {
    ipcMain.handle('belge-ekle', async (event, notId) => {
        const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] });
        if (canceled || filePaths.length === 0) return readData(belgeVeriYolu).filter(b => b.notId === notId);

        const belgeler = readData(belgeVeriYolu);
        const hedefKlasor = path.join(belgelerKlasoru, notId.toString());
        if (!fs.existsSync(hedefKlasor)) fs.mkdirSync(hedefKlasor, { recursive: true });

        for (const dosyaYolu of filePaths) {
            const orjinalAd = path.basename(dosyaYolu);
            const kayitliAd = `${Date.now()}_${orjinalAd}`;
            const hedefYol = path.join(hedefKlasor, kayitliAd);
            fs.copyFileSync(dosyaYolu, hedefYol);

            const goreceliYol = path.relative(uygulamaAnaKlasoru, hedefYol);
            belgeler.push({ id: Date.now(), notId, orjinalAd, kayitliAd, dosyaYolu: goreceliYol });
        }
        writeData(belgeVeriYolu, belgeler);
        return belgeler.filter(b => b.notId === notId);
    });

    // YENİ EKLENEN İŞLEYİCİ
    ipcMain.handle('belge-surukle-birak', async (event, { notId, filePaths }) => {
        if (!filePaths || filePaths.length === 0) {
            return readData(belgeVeriYolu).filter(b => b.notId === notId);
        }

        const belgeler = readData(belgeVeriYolu);
        const hedefKlasor = path.join(belgelerKlasoru, notId.toString());
        if (!fs.existsSync(hedefKlasor)) fs.mkdirSync(hedefKlasor, { recursive: true });

        for (const dosyaYolu of filePaths) {
            const orjinalAd = path.basename(dosyaYolu);
            // Dosyanın zaten var olup olmadığını kontrol et
            if (belgeler.some(b => b.notId === notId && b.orjinalAd === orjinalAd)) {
                console.log(`"${orjinalAd}" zaten mevcut, atlanıyor.`);
                continue; // Eğer dosya zaten varsa döngünün bir sonraki adımına geç
            }
            const kayitliAd = `${Date.now()}_${orjinalAd}`;
            const hedefYol = path.join(hedefKlasor, kayitliAd);
            fs.copyFileSync(dosyaYolu, hedefYol);

            const goreceliYol = path.relative(uygulamaAnaKlasoru, hedefYol);
            belgeler.push({ id: Date.now(), notId, orjinalAd, kayitliAd, dosyaYolu: goreceliYol });
        }

        writeData(belgeVeriYolu, belgeler);
        return belgeler.filter(b => b.notId === notId);
    });


    ipcMain.on('belge-ac', (event, goreceliYol) => {
        const mutlakYol = path.join(uygulamaAnaKlasoru, goreceliYol);
        if (fs.existsSync(mutlakYol)) {
            shell.openPath(mutlakYol).catch(err => console.error('HATA: Dosya açılamadı:', err));
        } else {
            dialog.showErrorBox('Dosya Bulunamadı', `Belirtilen yolda dosya mevcut değil:\n${mutlakYol}`);
        }
    });

    ipcMain.handle('belge-sil', (event, belgeId) => {
        try {
            const belgeler = readData(belgeVeriYolu);
            const belge = belgeler.find(b => b.id === belgeId);

            if (belge && belge.dosyaYolu) {
                const mutlakYol = path.join(uygulamaAnaKlasoru, belge.dosyaYolu);
                if (fs.existsSync(mutlakYol)) fs.unlinkSync(mutlakYol);
            }

            const guncelBelgeler = belgeler.filter(b => b.id !== belgeId);
            writeData(belgeVeriYolu, guncelBelgeler);
            return { success: true };
        } catch (error) {
            console.error('HATA: Belge silinirken hata:', error);
            return { success: false, message: 'Belge silinirken bir hata oluştu.' };
        }
    });
    
    ipcMain.handle('belge-yeniden-adlandir', (event, { notId, belgeId, yeniAd }) => {
        try {
            const belgeler = readData(belgeVeriYolu);
            const notlar = readData(notVeriYolu);
            const belgeIndex = belgeler.findIndex(b => b.id === belgeId);
            if (belgeIndex === -1) return { success: false, message: 'Belge bulunamadı.' };
            
            const belge = belgeler[belgeIndex];
            const eskiMutlakYol = path.join(uygulamaAnaKlasoru, belge.dosyaYolu);
            const dosyaKlasoru = path.dirname(eskiMutlakYol);
            const yeniKayitliAd = `${Date.now()}_${yeniAd}`;
            const yeniMutlakYol = path.join(dosyaKlasoru, yeniKayitliAd);
            
            if (fs.existsSync(eskiMutlakYol)) {
                 fs.renameSync(eskiMutlakYol, yeniMutlakYol);
            } else {
                return { success: false, message: `Fiziksel dosya diskte bulunamadı: ${eskiMutlakYol}` };
            }

            const yeniGoreceliYol = path.relative(uygulamaAnaKlasoru, yeniMutlakYol);
            belgeler[belgeIndex].orjinalAd = yeniAd;
            belgeler[belgeIndex].kayitliAd = yeniKayitliAd;
            belgeler[belgeIndex].dosyaYolu = yeniGoreceliYol;
            
            const notIndex = notlar.findIndex(n => n.id === notId);
            if (notIndex !== -1 && notlar[notIndex].notIcerik && notlar[notIndex].notIcerik.includes(`[[doc:${belgeId}|`)) {
                 const linkRegex = new RegExp(`(\\[\\[doc:${belgeId}\\|)(.*?)(]])`, 'g');
                 notlar[notIndex].notIcerik = notlar[notIndex].notIcerik.replace(linkRegex, `$1${yeniAd}$3`);
                 writeData(notVeriYolu, notlar);
            }

            writeData(belgeVeriYolu, belgeler);
            return { success: true };
        } catch (error) {
            console.error('HATA: Belge yeniden adlandırılırken kritik hata:', error);
            return { success: false, message: `Belge yeniden adlandırılırken bir hata oluştu: ${error.message}` };
        }
    });

    ipcMain.on('klasor-ac', (event, goreceliYol) => {
        if (!goreceliYol) return dialog.showErrorBox('Geçersiz Yol', 'Klasör açmak için bir dosya yolu belirtilmedi.');
        const mutlakYol = path.join(uygulamaAnaKlasoru, goreceliYol);
        if (fs.existsSync(mutlakYol)) {
            shell.showItemInFolder(mutlakYol);
        } else {
            dialog.showErrorBox('Dosya Bulunamadı', `Belirtilen yolda dosya mevcut değil:\n${mutlakYol}`);
        }
    });
}

module.exports = { registerBelgeHandlers };
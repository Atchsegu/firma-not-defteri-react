const { ipcMain } = require('electron');
const { readData } = require('../file-system-handler');
const { firmaVeriYolu, notVeriYolu, belgeVeriYolu } = require('../constants');

function registerAramaHandlers() {
    ipcMain.handle('global-arama', (event, aramaTerimi) => {
        const firmalar = readData(firmaVeriYolu);
        const notlar = readData(notVeriYolu);
        const belgeler = readData(belgeVeriYolu);
        const sonuclar = [];

        // Etiket araması: "etiket:Etiket Adı" formatı
        if (aramaTerimi.toLowerCase().startsWith('etiket:')) {
            const etiket = aramaTerimi.substring(7).toLowerCase();
            if (!etiket) return [];

            // Firmaları etiketlere göre filtrele
            firmalar.forEach(firma => {
                if (firma.tags && firma.tags.some(t => t.toLowerCase().includes(etiket))) {
                    sonuclar.push({ tip: 'Firma', id: firma.id, baslik: firma.unvan, aciklama: `"${etiket}" etiketine sahip` });
                }
            });

            // Notları ve not bloklarını etiketlere göre filtrele
            notlar.forEach(not => {
                const firma = firmalar.find(f => f.id === not.firmaId);
                const baslik = firma ? `${firma.unvan} -> ${not.tur}` : `${not.tur || 'Kişisel Not'}`;
                let eslesme = false;

                // Ana not etiketlerini kontrol et
                if (not.tags && not.tags.some(t => t.toLowerCase().includes(etiket))) {
                    eslesme = true;
                }
                // Not bloklarının etiketlerini kontrol et
                if (!eslesme && Array.isArray(not.notIcerik)) {
                    if (not.notIcerik.some(blok => blok.tags && blok.tags.some(t => t.toLowerCase().includes(etiket)))) {
                        eslesme = true;
                    }
                }

                if (eslesme) {
                    // Aynı notun tekrar eklenmesini önle
                    if (!sonuclar.some(s => s.tip === 'Not' && s.id === not.id)) {
                        sonuclar.push({ tip: 'Not', id: not.id, firmaId: not.firmaId, baslik, aciklama: `"${etiket}" etiketine sahip not` });
                    }
                }
            });

            return sonuclar;
        }

        // --- Mevcut Genel Arama (Full-text search) ---
        const term = aramaTerimi.toLowerCase();
        if (!term) return [];

        const eklenenNotIdleri = new Set(); 

        for (const firma of firmalar) {
            if (firma.unvan.toLowerCase().includes(term) || firma.vergiNo?.toLowerCase().includes(term)) {
                sonuclar.push({ tip: 'Firma', id: firma.id, baslik: firma.unvan, aciklama: `Vergi No: ${firma.vergiNo}` });
                const firmaNotlari = notlar.filter(n => n.firmaId === firma.id);
                for (const not of firmaNotlari) {
                    if (!eklenenNotIdleri.has(not.id)) {
                        sonuclar.push({ tip: 'Not', id: not.id, firmaId: not.firmaId, baslik: `${firma.unvan} -> ${not.tur}`, aciklama: `Firmaya ait not: ${not.donem}` });
                        eklenenNotIdleri.add(not.id);
                    }
                }
            }
        }

        for (const not of notlar) {
            if (eklenenNotIdleri.has(not.id)) continue;
            
            let eslesme = false;
            let eslesmeAlani = '';

            if (not.tur?.toLowerCase().includes(term)) { eslesme = true; eslesmeAlani = `Not türü: ${not.tur}`; } 
            else if (not.donem?.toLowerCase().includes(term)) { eslesme = true; eslesmeAlani = `Dönem/Açıklama: ${not.donem}`; }
            else if (Array.isArray(not.notIcerik)) {
                for (const blok of not.notIcerik) {
                    if (blok.content && blok.content.toLowerCase().includes(term)) {
                        eslesme = true;
                        const index = blok.content.toLowerCase().indexOf(term);
                        const start = Math.max(0, index - 20);
                        const end = Math.min(blok.content.length, index + 50);
                        eslesmeAlani = `İçerik: ...${blok.content.substring(start, end)}...`;
                        break;
                    }
                }
            }

            if (eslesme) {
                const firma = firmalar.find(f => f.id === not.firmaId);
                const baslik = firma ? `${firma.unvan} -> ${not.tur}` : `${not.tur || 'Kişisel Not'}`;
                sonuclar.push({ tip: 'Not', id: not.id, firmaId: not.firmaId, baslik, aciklama: eslesmeAlani });
                eklenenNotIdleri.add(not.id);
            }
        }

        for (const belge of belgeler) {
            if (belge.orjinalAd.toLowerCase().includes(term)) {
                const not = notlar.find(n => n.id === belge.notId);
                if (not) {
                     const firma = firmalar.find(f => f.id === not.firmaId);
                     const baslik = firma ? `${firma.unvan} -> Belge` : `Kişisel Not -> Belge`;
                     sonuclar.push({ tip: 'Belge', id: belge.id, notId: not.id, firmaId: not.firmaId, baslik: belge.orjinalAd, aciklama: `"${baslik}" notuna ait.`});
                }
            }
        }
        return sonuclar;
    });
}

module.exports = { registerAramaHandlers };
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // ---- VERİ ÇEKME (Renderer -> Main -> Renderer) ----
    firmalariGetir: () => ipcRenderer.invoke('firmalari-getir'),
    notlariGetir: (firmaId) => ipcRenderer.invoke('notlari-getir', firmaId),
    kisiselNotlariGetir: () => ipcRenderer.invoke('kisisel-notlari-getir'),
    getNotDetay: (notId) => ipcRenderer.invoke('get-not-detay', notId),
    kisileriGetir: () => ipcRenderer.invoke('kisileri-getir'),
    globalArama: (aramaTerimi) => ipcRenderer.invoke('global-arama', aramaTerimi),
    etiketleriGetir: () => ipcRenderer.invoke('etiketleri-getir'),
    ayarlariGetir: () => ipcRenderer.invoke('ayarlari-getir'), // YENİ EKLENDİ

    // ---- VERİ GÖNDERME (Renderer -> Main) ----
    yeniFirmaKaydet: (firmaData) => ipcRenderer.send('yeni-firma', firmaData),
    yeniKisiEkle: (adSoyad) => ipcRenderer.send('yeni-kisi-ekle', adSoyad),
    yeniNotKaydet: (notData) => ipcRenderer.send('yeni-not', notData),
    belgeAc: (dosyaYolu) => ipcRenderer.send('belge-ac', dosyaYolu),
    klasorAc: (dosyaYolu) => ipcRenderer.send('klasor-ac', dosyaYolu),
    etiketEkle: (yeniEtiketler) => ipcRenderer.send('etiket-ekle', yeniEtiketler),
    
    // ---- GÜNCELLEME & SİLME & DİĞER İŞLEMLER (Renderer -> Main -> Renderer) ----
    ayarlariKaydet: (ayarlar) => ipcRenderer.invoke('ayarlari-kaydet', ayarlar), // YENİ EKLENDİ
    testEmailGonder: () => ipcRenderer.invoke('test-email-gonder'), // YENİ EKLENDİ
    firmaGuncelle: (firmaData) => ipcRenderer.invoke('firma-guncelle', firmaData),
    firmaSil: (firmaId) => ipcRenderer.invoke('firma-sil', firmaId),
    notGuncelle: (notData) => ipcRenderer.invoke('not-guncelle', notData),
    notIcerikKaydet: (data) => ipcRenderer.invoke('not-icerik-kaydet', data),
    notSil: (notId) => ipcRenderer.invoke('not-sil', notId),
    kisiSil: (kisiId) => ipcRenderer.invoke('kisi-sil', kisiId),
    belgeEkle: (notId) => ipcRenderer.invoke('belge-ekle', notId),
    belgeSurukleBirak: (data) => ipcRenderer.invoke('belge-surukle-birak', data),
    belgeSil: (belgeId) => ipcRenderer.invoke('belge-sil', belgeId),
    belgeYenidenAdlandir: (data) => ipcRenderer.invoke('belge-yeniden-adlandir', data),

    // --- MAINDEN GELEN VERİLERİ DİNLEME (Main -> Renderer) ---
    onFirmalarGuncelle: (callback) => ipcRenderer.on('firmalar-guncellendi', (_event, value) => callback(value)),
    onNotlarGuncellendi: (callback) => ipcRenderer.on('notlar-guncellendi', (_event, value) => callback(value)),
    onKisilerGuncellendi: (callback) => ipcRenderer.on('kisiler-guncellendi', (_event, value) => callback(value)),
    onYeniNotRequest: (callback) => ipcRenderer.on('menu-yeni-not', () => callback()),
    onNotKaydetRequest: (callback) => {
        const listener = () => callback();
        ipcRenderer.on('menu-not-kaydet', listener);
        return { remove: () => ipcRenderer.removeListener('menu-not-kaydet', listener) };
    },
    onEtiketEkleEvent: (callback) => ipcRenderer.on('etiket-ekle-event', (_event, etiketler) => callback(etiketler))
});
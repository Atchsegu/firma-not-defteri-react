// main process ile olan tüm iletişimi bu dosya yönetir.

// --- Invoke (Cevap Beklenen) Çağrıları ---
export const firmalariGetir = () => window.api.firmalariGetir();
export const globalArama = (term) => window.api.globalArama(term);
export const firmaSil = (id) => window.api.firmaSil(id);
export const firmaGuncelle = (data) => window.api.firmaGuncelle(data);
export const kisileriGetir = () => window.api.kisileriGetir();
export const kisiSil = (id) => window.api.kisiSil(id);
export const notlariGetir = (id) => window.api.notlariGetir(id);
export const kisiselNotlariGetir = () => window.api.kisiselNotlariGetir();
export const getNotDetay = (id) => window.api.getNotDetay(id);
export const notIcerikKaydet = (data) => window.api.notIcerikKaydet(data);
export const belgeEkle = (id) => window.api.belgeEkle(id);
export const belgeSurukleBirak = (data) => window.api.belgeSurukleBirak(data);
export const notSil = (id) => window.api.notSil(id);
export const notGuncelle = (data) => window.api.notGuncelle(data);
export const belgeSil = (id) => window.api.belgeSil(id);
export const belgeYenidenAdlandir = (data) => window.api.belgeYenidenAdlandir(data);
export const etiketleriGetir = () => window.api.etiketleriGetir();
export const ayarlariGetir = () => window.api.ayarlariGetir(); // YENİ EKLENDİ
export const ayarlariKaydet = (data) => window.api.ayarlariKaydet(data); // YENİ EKLENDİ
export const testEmailGonder = () => window.api.testEmailGonder(); // YENİ EKLENDİ


// --- Send (Tek Yönlü) Çağrılar ---
export const yeniFirmaKaydet = (data) => window.api.yeniFirmaKaydet(data);
export const yeniKisiEkle = (ad) => window.api.yeniKisiEkle(ad);
export const yeniNotKaydet = (data) => window.api.yeniNotKaydet(data);
export const belgeAc = (path) => window.api.belgeAc(path);
export const klasorAc = (path) => window.api.klasorAc(path);
export const etiketEkle = (etiketler) => window.api.etiketEkle(etiketler);

// --- Main'den Gelen Verileri Dinleyiciler ---
export const onFirmalarGuncelle = (callback) => window.api.onFirmalarGuncelle(callback);
export const onNotlarGuncellendi = (callback) => window.api.onNotlarGuncellendi(callback);
export const onKisilerGuncellendi = (callback) => window.api.onKisilerGuncellendi(callback);
export const onYeniNotRequest = (callback) => window.api.onYeniNotRequest(callback);
export const onNotKaydetRequest = (callback) => window.api.onNotKaydetRequest(callback);
export const onEtiketEkleEvent = (callback) => window.api.onEtiketEkleEvent(callback);
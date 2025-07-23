import React, { useMemo } from 'react';

const AramaSonuclari = ({ sonuclar, onItemClick }) => {
    // Sonuçları tiplerine göre gruplamak için useMemo kullanıyoruz.
    // Bu, "sonuclar" prop'u değişmediği sürece yeniden hesaplama yapılmasını engeller.
    const gruplanmisSonuclar = useMemo(() => {
        if (!sonuclar) {
            return {};
        }
        return sonuclar.reduce((acc, sonuc) => {
            let tip = sonuc.tip;
            if (tip === 'Not' || tip === 'Belge') {
                tip = 'Notlar ve Belgeler'; // Not ve Belgeleri aynı grup altında topla
            }
            if (!acc[tip]) {
                acc[tip] = [];
            }
            acc[tip].push(sonuc);
            return acc;
        }, {});
    }, [sonuclar]);

    const getIcon = (tip) => {
        switch (tip) {
            case 'Firma': return '🏢';
            case 'Not': return '📝';
            case 'Belge': return '📄';
            case 'Etiket': return '#️⃣'; // Etiket için yeni ikon
            default: return '🔍';
        }
    };

    // Her bir kategori için listeyi render eden fonksiyon
    const renderSonucGrubu = (grupAdi, grupSonuclari) => (
        <div key={grupAdi}>
            <h3 style={{ marginTop: '20px', marginBottom: '15px', borderBottom: '2px solid var(--primary-color)', paddingBottom: '10px' }}>{grupAdi}</h3>
            <ul className="arama-sonuc-listesi-grup">
                {grupSonuclari.map((sonuc, index) => (
                    <li
                        key={`${sonuc.tip}-${sonuc.id}-${index}`}
                        className="arama-sonuc-item"
                        onClick={() => onItemClick(sonuc)}
                    >
                        <span className="arama-icon">{getIcon(sonuc.tip)}</span>
                        <div className="arama-detay">
                            <strong>{sonuc.baslik}</strong>
                            <small>{sonuc.aciklama}</small>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );

    const kategoriler = Object.keys(gruplanmisSonuclar);

    return (
        <div id="arama-sonuc-alani">
            <h2>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="24" height="24" fill="currentColor"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>
                Arama Sonuçları
            </h2>
            {sonuclar && sonuclar.length > 0 ? (
                kategoriler.map(kategori => renderSonucGrubu(kategori, gruplanmisSonuclar[kategori]))
            ) : (
                <p className="arama-sonuc-item-yok">Arama sonucu bulunamadı.</p>
            )}
        </div>
    );
};

export default AramaSonuclari;
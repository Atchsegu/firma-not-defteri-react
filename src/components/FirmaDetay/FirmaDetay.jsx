import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../../services/api';
import EtiketInput from '../EtiketInput/EtiketInput';

const FirmaDetay = ({ firma, notlar, kisiler, tumEtiketler, onNotSec, onFirmaDuzenle, onFirmaSil, onNotSubmit, notDuzenlemeModu, setNotDuzenlemeModu, onNotSil, isPersonal = false }) => {
    // Form state'leri
    const [notTuru, setNotTuru] = useState('Aylık Beyanname');
    const [notDonem, setNotDonem] = useState('');
    const [notTarihi, setNotTarihi] = useState(new Date().toISOString().split('T')[0]);
    const [notuAlan, setNotuAlan] = useState(kisiler.length > 0 ? kisiler[0].adSoyad : '');
    const [notEtiketleri, setNotEtiketleri] = useState([]);

    // Filtreleme için state'ler
    const [filtreler, setFiltreler] = useState({
        tur: '',
        notuAlan: '',
        baslangicTarihi: '',
        bitisTarihi: '',
    });

    useEffect(() => {
        if (notDuzenlemeModu) {
            const notToEdit = notlar.find(n => n.id === notDuzenlemeModu);
            if (notToEdit) {
                setNotTuru(notToEdit.tur);
                setNotDonem(notToEdit.donem);
                setNotTarihi(new Date(notToEdit.notTarihi).toISOString().split('T')[0]);
                setNotuAlan(notToEdit.notuAlan);
                setNotEtiketleri(notToEdit.tags || []);
            }
        } else {
            setNotEtiketleri([]);
        }
    }, [notDuzenlemeModu, notlar]);
    
    const filtrelenmisNotlar = useMemo(() => {
        return notlar.filter(not => {
            if (filtreler.tur && not.tur !== filtreler.tur) return false;
            if (filtreler.notuAlan && not.notuAlan !== filtreler.notuAlan) return false;
            const notunTarihi = new Date(not.notTarihi);
            if (filtreler.baslangicTarihi && notunTarihi < new Date(filtreler.baslangicTarihi)) return false;
            if (filtreler.bitisTarihi && notunTarihi > new Date(filtreler.bitisTarihi)) return false;
            return true;
        });
    }, [notlar, filtreler]);


    const handleFiltreChange = (e) => {
        const { name, value } = e.target;
        setFiltreler(prev => ({ ...prev, [name]: value }));
    };

    const handleFiltreTemizle = () => {
        setFiltreler({ tur: '', notuAlan: '', baslangicTarihi: '', bitisTarihi: '' });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const notData = {
            id: notDuzenlemeModu,
            firmaId: firma ? firma.id : null,
            tur: isPersonal ? 'Kişisel Not' : notTuru,
            donem: notDonem,
            notTarihi,
            notuAlan,
            tags: notEtiketleri,
        };
        onNotSubmit(notData);
        // Formu temizle
        setNotDuzenlemeModu(null);
        setNotTuru('Aylık Beyanname');
        setNotDonem('');
        setNotTarihi(new Date().toISOString().split('T')[0]);
        setNotuAlan(kisiler.length > 0 ? kisiler[0].adSoyad : '');
        setNotEtiketleri([]);
    };

    const handleNotDuzenle = (notId) => {
        setNotDuzenlemeModu(notId);
        document.getElementById('not-formu').scrollIntoView({ behavior: 'smooth' });
    };

    const handleFirmaEtiketGuncelle = (yeniEtiketler) => {
        if (firma) {
            const guncelFirma = { ...firma, tags: yeniEtiketler };
            api.firmaGuncelle(guncelFirma);
        }
    };

    const renderNotList = () => {
        if (!notlar || notlar.length === 0) {
            const mesaj = isPersonal ? 'Henüz kişisel not kaydınız bulunamadı.' : 'Bu firmaya ait not kaydı bulunamadı.';
            return <li>{mesaj}</li>;
        }

        if (filtrelenmisNotlar.length === 0) {
            return <li>Filtre kriterlerine uygun not bulunamadı.</li>;
        }

        return filtrelenmisNotlar.map(not => (
            <li key={not.id}>
                <div className="not-detay-sol">
                    <span className="not-basligi" data-id={not.id} onClick={() => onNotSec(not.id)}>
                        {new Date(not.notTarihi).toLocaleDateString('tr-TR')} - {not.tur} ({not.donem})
                    </span>
                    <div className="etiket-listesi">
                        {not.tags && not.tags.map(tag => <span key={tag} className="etiket">{tag}</span>)}
                    </div>
                </div>
                <div className="not-aksiyonlari">
                    <button className="btn btn-secondary duzenle-btn" data-id={not.id} onClick={() => handleNotDuzenle(not.id)}>Düzenle</button>
                    <button className="btn btn-danger sil-btn" data-id={not.id} onClick={() => onNotSil(not.id)}>Sil</button>
                </div>
            </li>
        ));
    };

    return (
        <div id="detay-alani">
            <h2 id="secili-firma-unvan">{isPersonal ? 'Kişisel Notlarım' : firma?.unvan}</h2>
            {!isPersonal && <p id="secili-firma-vergino">Vergi No: {firma?.vergiNo}</p>}
            
            {!isPersonal && firma && (
                <div className="etiket-yonetim-alani">
                    <label>Firma Etiketleri:</label>
                    <EtiketInput 
                        mevcutEtiketler={firma.tags || []}
                        setMevcutEtiketler={handleFirmaEtiketGuncelle}
                        onerilenEtiketler={tumEtiketler}
                    />
                </div>
            )}
            
            <hr />
            <h3>Notlar</h3>

            <div className="filtre-alani">
                 {!isPersonal && (
                    <select name="tur" value={filtreler.tur} onChange={handleFiltreChange}>
                        <option value="">Tüm Not Türleri</option>
                        <option value="Aylık Beyanname">Aylık Beyanname</option>
                        <option value="Geçici Vergi">Geçici Vergi</option>
                        <option value="Kurumlar Vergisi">Kurumlar Vergisi</option>
                        <option value="Diğer Notlar">Diğer</option>
                    </select>
                 )}
                <select name="notuAlan" value={filtreler.notuAlan} onChange={handleFiltreChange}>
                    <option value="">Tüm Kişiler</option>
                    {kisiler.map(k => <option key={k.id} value={k.adSoyad}>{k.adSoyad}</option>)}
                </select>
                <input type="date" name="baslangicTarihi" value={filtreler.baslangicTarihi} onChange={handleFiltreChange} />
                <input type="date" name="bitisTarihi" value={filtreler.bitisTarihi} onChange={handleFiltreChange} />
                <button className="btn btn-secondary" onClick={handleFiltreTemizle}>Temizle</button>
            </div>


            <ul id="not-listesi">
                {renderNotList()}
            </ul>
            <hr />
            <h4 id="not-form-baslik">{notDuzenlemeModu ? 'Not Bilgilerini Güncelle' : 'Yeni Not Ekle'}</h4>
            <form id="not-formu" onSubmit={handleFormSubmit}>
                <input type="hidden" id="duzenlenen-not-id" value={notDuzenlemeModu || ''} />

                {!isPersonal && (
                    <div id="not-turu-wrapper">
                        <label htmlFor="not-turu">Not Türü:</label>
                        <select id="not-turu" value={notTuru} onChange={e => setNotTuru(e.target.value)} required>
                            <option value="Aylık Beyanname">Aylık Beyanname ile İlgili Notlar</option>
                            <option value="Geçici Vergi">Geçici Vergi Beyannamesi ile İlgili Notlar</option>
                            <option value="Kurumlar Vergisi">Kurumlar Vergisi Beyannamesi ile İlgili Notlar</option>
                            <option value="Diğer Notlar">Diğer Notlar</option>
                        </select>
                    </div>
                )}
                
                <label htmlFor="not-donem">Dönem/Açıklama:</label>
                <input 
                    type="text" 
                    id="not-donem" 
                    placeholder="Örn: Temmuz 2025" 
                    value={notDonem}
                    onChange={e => setNotDonem(e.target.value)}
                    required 
                />
                
                <label htmlFor="not-tarihi">Not Tarihi:</label>
                <input 
                    type="date" 
                    id="not-tarihi" 
                    value={notTarihi}
                    onChange={e => setNotTarihi(e.target.value)}
                    required 
                />
                
                <label htmlFor="notu-alan">Notu Alan Kişi:</label>
                <select 
                    id="notu-alan" 
                    value={notuAlan}
                    onChange={e => setNotuAlan(e.target.value)}
                    required
                >
                    {kisiler.map(kisi => (
                        <option key={kisi.id} value={kisi.adSoyad}>{kisi.adSoyad}</option>
                    ))}
                </select>

                <label htmlFor="not-etiketler">Not Etiketleri:</label>
                <EtiketInput 
                    mevcutEtiketler={notEtiketleri}
                    setMevcutEtiketler={setNotEtiketleri}
                    onerilenEtiketler={tumEtiketler}
                />

                <button type="submit" className="btn btn-primary" id="not-form-btn" style={{marginTop: '20px'}}>
                    {notDuzenlemeModu ? 'Notu Güncelle' : 'Not Ekle'}
                </button>
            </form>
            
            {!isPersonal && (
                <>
                    <hr style={{marginTop: '30px'}} />
                    <div id="firma-aksiyon-alani" style={{ display: 'flex', gap: '10px' }}>
                         <button id="firma-duzenle-btn" className="btn btn-secondary" onClick={onFirmaDuzenle}>Firmayı Düzenle</button>
                         <button id="firma-sil-btn" className="btn btn-danger" onClick={onFirmaSil}>Firmayı Sil</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default FirmaDetay;
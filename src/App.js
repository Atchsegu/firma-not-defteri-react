import React, { useState, useEffect } from 'react';
import './css/style.css';
import FirmaListesi from './components/FirmaListesi/FirmaListesi.jsx';
import FirmaDetay from './components/FirmaDetay/FirmaDetay.jsx';
import YeniFirma from './components/YeniFirma/YeniFirma.jsx';
import NotDetay from './components/NotDetay/NotDetay.jsx';
import KisiYonetimi from './components/KisiYonetimi/KisiYonetimi.jsx';
import AramaSonuclari from './components/AramaSonuclari/AramaSonuclari.jsx';
import Ayarlar from './components/Ayarlar/Ayarlar.jsx'; // YENİ EKLENDİ
import * as api from './services/api.js';
import 'ckeditor5/ckeditor5.css';

// --- İkonlar ---
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16"><path fill="currentColor" d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="16" height="16"><path fill="currentColor" d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="16" height="16"><path fill="currentColor" d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/></svg>;
const NoteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="16" height="16"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128z"/></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="16" height="16"><path fill="currentColor" d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C378.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3zM609.3 512H471.4c5.4-9.4 8.6-20.3 8.6-32v-8c0-60.7-27.1-115.2-69.8-151.8c2.4-.2 4.7-.3 7.1-.3h64c11.9 0 23.7 1.2 35.4 3.4c21.2 3.9 40.1 11.4 54.8 21.2c16.1 10.6 29.5 24.3 39.6 40.1c11 17.2 16.5 36.6 16.5 56.8v8c0 16.4-13.3 29.7-29.7 29.7zM480 256a96 96 0 1 1 128 0 96 96 0 1 1 -128 0z"/></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16"><path fill="currentColor" d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9.9 15.9-19.4 15.9H184c-9.6 0-17.4-6.8-19.4-15.9l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L52.4 466.1c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C17.2 241.1 16.6 232.6 16.6 224s.6-17.1 1.7-25.4L15 159.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1 31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1-9.9-15.9-19.4-15.9h96c9.6 0 17.4 6.8 19.4 15.9l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6 .3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"/></svg>;


function App() {
  const [firmalar, setFirmalar] = useState([]);
  const [kisiler, setKisiler] = useState([]);
  const [seciliFirma, setSeciliFirma] = useState(null);
  const [seciliNot, setSeciliNot] = useState(null);
  const [notlar, setNotlar] = useState([]);
  const [mevcutBelgeler, setMevcutBelgeler] = useState([]);
  const [mevcutGorunum, setMevcutGorunum] = useState('yeniFirma');
  const [isEditingFirma, setIsEditingFirma] = useState(false);
  const [notDuzenlemeModu, setNotDuzenlemeModu] = useState(null);
  const [aramaTerimi, setAramaTerimi] = useState('');
  const [aramaSonuclari, setAramaSonuclari] = useState([]);
  const [oncekiGorunum, setOncekiGorunum] = useState('yeniFirma');
  const [tumEtiketler, setTumEtiketler] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setFirmalar(await api.firmalariGetir());
      setKisiler(await api.kisileriGetir());
      setTumEtiketler(await api.etiketleriGetir());
    };
    fetchData();

    api.onFirmalarGuncelle(setFirmalar);
    api.onKisilerGuncellendi(setKisiler);
    api.onNotlarGuncellendi((guncelNotlar) => setNotlar(guncelNotlar));

    api.onYeniNotRequest(() => {
      setNotDuzenlemeModu(null);
      if (seciliFirma) {
        setMevcutGorunum('firmaDetay');
      } else {
        handleKisiselNotlariGoster();
      }
    });

    api.onEtiketEkleEvent((yeniEtiketler) => {
        api.etiketEkle(yeniEtiketler);
        const guncelEtiketleriGetir = async () => {
            setTumEtiketler(await api.etiketleriGetir());
        };
        guncelEtiketleriGetir();
    });

  }, [seciliFirma]);

  useEffect(() => {
    const fetchNotlar = async () => {
      if (seciliFirma && mevcutGorunum === 'firmaDetay') {
        const notlarData = await api.notlariGetir(seciliFirma.id);
        setNotlar(notlarData);
      } else {
        setNotlar([]);
      }
    };
    fetchNotlar();
  }, [seciliFirma, mevcutGorunum]);

  const handleFirmaSec = async (firmaId) => {
    const firma = firmalar.find(f => f.id === firmaId);
    if (firma) {
      setSeciliFirma(firma);
      setIsEditingFirma(false);
      setMevcutGorunum('firmaDetay');
      setAramaTerimi('');
    }
  };

  const handleKisiselNotlariGoster = async () => {
    setSeciliFirma(null);
    setSeciliNot(null);
    setMevcutGorunum('kisiselNotlar');
    setAramaTerimi('');
    const notlarData = await api.kisiselNotlariGetir();
    setNotlar(notlarData);
  };

  const handleYeniFirmaClick = () => {
    setSeciliFirma(null);
    setIsEditingFirma(false);
    setMevcutGorunum('yeniFirma');
    setAramaTerimi('');
  };

  const handleNotSec = async (notId) => {
    const data = await api.getNotDetay(notId);
    if (data && data.not) {
      setSeciliNot(data.not);
      setMevcutBelgeler(data.belgeler);
      setMevcutGorunum('notDetay');
    }
  };

  const handleArama = async (term) => {
    setAramaTerimi(term);

    if (term.startsWith('#')) {
        const etiketSorgusu = term.substring(1).toLowerCase();
        if (etiketSorgusu.length > 0) {
            const oneriler = tumEtiketler.filter(t => t.toLowerCase().includes(etiketSorgusu));
            const formatliOneriler = oneriler.map(o => ({ 
                tip: 'Etiket', 
                id: o, 
                baslik: o, 
                aciklama: `"${o}" etiketine sahip olanları ara` 
            }));
            setAramaSonuclari(formatliOneriler);
        } else {
            setAramaSonuclari([]);
        }
        setMevcutGorunum('arama');
        return;
    }

    if (term.length < 2) {
      setAramaSonuclari([]);
      if (mevcutGorunum === 'arama') {
        setMevcutGorunum(oncekiGorunum);
      }
      return;
    }
    if (mevcutGorunum !== 'arama') {
      setOncekiGorunum(mevcutGorunum);
    }
    setMevcutGorunum('arama');
    const results = await api.globalArama(term);
    setAramaSonuclari(results);
  };

  const handleAramaSonucClick = async (item) => {
    setAramaSonuclari([]);
    
    if (item.tip === 'Etiket') {
        const etiketSorgusu = `etiket:${item.baslik}`;
        setAramaTerimi(etiketSorgusu);
        const results = await api.globalArama(etiketSorgusu);
        setAramaSonuclari(results);
        return;
    }

    setAramaTerimi('');

    if (item.tip === 'Firma') {
      await handleFirmaSec(item.id);
    } else if (item.tip === 'Not' || item.tip === 'Belge') {
      const firmaId = item.firmaId;
      if (firmaId) {
        await handleFirmaSec(firmaId);
      } else {
        await handleKisiselNotlariGoster();
      }
      setTimeout(() => handleNotSec(item.notId || item.id), 150);
    }
  };

  const handleGeriDon = () => {
    setSeciliNot(null);
    if (seciliFirma) {
      setMevcutGorunum('firmaDetay');
    } else {
      setMevcutGorunum('kisiselNotlar');
    }
  };

  const handleFirmaDuzenle = () => {
    setIsEditingFirma(true);
    setMevcutGorunum('yeniFirma');
  };

  const handleFirmaSil = async () => {
    if (!seciliFirma) return;
    const confirmed = window.confirm(`'${seciliFirma.unvan}' firmasını silmek istediğinizden emin misiniz?\nBu işlem geri alınamaz!`);
    if (confirmed) {
      const result = await api.firmaSil(seciliFirma.id);
      alert(result.message);
      if (result.success) {
        setSeciliFirma(null);
        handleYeniFirmaClick();
      }
    }
  };

  const handleNotKaydet = async (notData) => {
    if (notDuzenlemeModu) {
      await api.notGuncelle({ ...notData, id: notDuzenlemeModu });
    } else {
      await api.yeniNotKaydet(notData);
    }
    setNotDuzenlemeModu(null);
  };

  const handleNotSil = async (notId) => {
    if (window.confirm("Bu not kaydını ve ilişkili belgeleri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
      const result = await api.notSil(notId);
      if (!result.success) {
        alert(result.message || 'Not silinirken bir hata oluştu.');
      }
    }
  };

  const handleKisiYonetimiKapat = () => {
    setMevcutGorunum(oncekiGorunum);
  };

  const handleAyarlarKapat = () => {
    setMevcutGorunum(oncekiGorunum);
  };

  const handleBelgelerGuncelle = (yeniBelgeler) => {
    setMevcutBelgeler(yeniBelgeler);
  };

  const renderMainContent = () => {
    if (mevcutGorunum === 'arama') {
      return <AramaSonuclari sonuclar={aramaSonuclari} onItemClick={handleAramaSonucClick} />;
    }

    switch (mevcutGorunum) {
      case 'yeniFirma':
        return <YeniFirma firma={isEditingFirma ? seciliFirma : null} tumEtiketler={tumEtiketler} />;
      case 'firmaDetay':
        return seciliFirma ? (
          <FirmaDetay
            firma={seciliFirma}
            notlar={notlar}
            kisiler={kisiler}
            tumEtiketler={tumEtiketler}
            onNotSec={handleNotSec}
            onFirmaDuzenle={handleFirmaDuzenle}
            onFirmaSil={handleFirmaSil}
            onNotSubmit={handleNotKaydet}
            notDuzenlemeModu={notDuzenlemeModu}
            setNotDuzenlemeModu={setNotDuzenlemeModu}
            onNotSil={handleNotSil}
            isPersonal={false}
          />
        ) : (
          <YeniFirma tumEtiketler={tumEtiketler} />
        );
      case 'kisiselNotlar':
        return <FirmaDetay
                  notlar={notlar}
                  kisiler={kisiler}
                  tumEtiketler={tumEtiketler}
                  onNotSec={handleNotSec}
                  onNotSubmit={handleNotKaydet}
                  notDuzenlemeModu={notDuzenlemeModu}
                  setNotDuzenlemeModu={setNotDuzenlemeModu}
                  onNotSil={handleNotSil}
                  isPersonal={true}
                />;
      case 'notDetay':
        return <NotDetay not={seciliNot} belgeler={mevcutBelgeler} onGeriDon={handleGeriDon} setBelgeler={handleBelgelerGuncelle} tumEtiketler={tumEtiketler} />;
      case 'kisiYonetimi':
        return <KisiYonetimi
                  kisiler={kisiler}
                  onKapat={handleKisiYonetimiKapat} 
                />;
      case 'ayarlar':
        return <Ayarlar onKapat={handleAyarlarKapat} />;
      default:
        return <YeniFirma tumEtiketler={tumEtiketler} />;
    }
  };

  return (
    <div className="container">
      <div className="sidebar">
        <div>
          <div className="search-wrapper">
            <SearchIcon />
            <input
              type="search"
              id="global-arama-input"
              placeholder="Her Yerde Ara... (#etiket)"
              value={aramaTerimi}
              onChange={(e) => handleArama(e.target.value)}
            />
          </div>
          <hr className="sidebar-divider" />
          <ul id="genel-menu">
            <li id="yeni-firma-ekle-btn" className={mevcutGorunum === 'yeniFirma' && !isEditingFirma ? 'active' : ''} onClick={handleYeniFirmaClick}>
              <PlusIcon />
              Yeni Firma Ekle
            </li>
            <li id="kisisel-notlar-btn" className={mevcutGorunum === 'kisiselNotlar' ? 'active' : ''} onClick={handleKisiselNotlariGoster}>
              <NoteIcon />
              Kişisel Notlarım
            </li>
          </ul>
          <hr className="sidebar-divider" />
          <FirmaListesi
            firmalar={firmalar}
            onFirmaSec={handleFirmaSec}
            seciliFirmaId={seciliFirma ? seciliFirma.id : null}
          />
        </div>
        <div className="sidebar-footer">
          <div style={{ display: 'flex', gap: '10px' }}>
            <button id="kisi-yonetimi-goster-btn" className="btn btn-secondary btn-full-width" onClick={() => { setOncekiGorunum(mevcutGorunum); setMevcutGorunum('kisiYonetimi'); }}>
                <UsersIcon />
                Kişi Yönetimi
            </button>
            <button id="ayarlar-goster-btn" className="btn btn-secondary btn-full-width" onClick={() => { setOncekiGorunum(mevcutGorunum); setMevcutGorunum('ayarlar'); }}>
                <SettingsIcon />
                Ayarlar
            </button>
          </div>
        </div>
      </div>
      <div className="main-content">
        {renderMainContent()}
      </div>
    </div>
  );
}

export default App;
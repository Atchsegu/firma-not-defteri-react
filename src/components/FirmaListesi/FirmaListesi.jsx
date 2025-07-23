import React, { useState } from 'react';
import './FirmaListesi.css';

const FirmaListesi = ({ firmalar, onFirmaSec, seciliFirmaId }) => {
  // Arama metnini tutmak için bir state (durum) oluşturuyoruz.
  const [aramaTerimi, setAramaTerimi] = useState('');

  // Arama kutusuna yazılan metne göre firmaları filtreliyoruz.
  const filtrelenmisFirmalar = firmalar.filter(firma =>
    firma.unvan.toLowerCase().includes(aramaTerimi.toLowerCase())
  );
  
  const BuildingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="20" height="20" fill="currentColor"><path d="M48 0C21.5 0 0 21.5 0 48V464c0 26.5 21.5 48 48 48H336c26.5 0 48-21.5 48-48V48c0-26.5-21.5-48-48-48H48zM64 240c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V240zm112-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V240c0-8.8 7.2-16 16-16zm80 16c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H272c-8.8 0-16-7.2-16-16V240zM80 96h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16zm80 16c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V112zM272 96h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H272c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16zM64 368c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V368zm112-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V368c0-8.8 7.2-16 16-16zm80 16c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H272c-8.8 0-16-7.2-16-16V368z"/></svg>;


  return (
    <div className="firma-list-container">
      <h2><BuildingIcon />Firmalar</h2>
      <div className="search-wrapper">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>
        <input 
          type="search" 
          id="firma-arama" 
          placeholder="Sadece Firmalarda Ara..."
          value={aramaTerimi}
          onChange={(e) => setAramaTerimi(e.target.value)} // Her harf girişinde state'i güncelle
        />
      </div>
      <ul id="firma-listesi">
        {filtrelenmisFirmalar.length > 0 ? (
          filtrelenmisFirmalar.map(firma => (
            <li 
              key={firma.id} 
              className={firma.id === seciliFirmaId ? 'active' : ''} // Seçili firmayı vurgula
              onClick={() => onFirmaSec(firma.id)}
            >
              {firma.unvan}
            </li>
          ))
        ) : (
          <li>Sonuç bulunamadı.</li>
        )}
      </ul>
    </div>
  );
};

export default FirmaListesi;
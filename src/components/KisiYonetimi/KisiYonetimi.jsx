import React, { useState } from 'react';
import * as api from '../../services/api';

const KisiYonetimi = ({ kisiler, onKapat }) => {
    const [yeniKisi, setYeniKisi] = useState('');

    const handleKisiEkle = (e) => {
        e.preventDefault();
        if (yeniKisi.trim()) {
            api.yeniKisiEkle(yeniKisi.trim()); // API'ye gönder
            setYeniKisi(''); // Input'u temizle
        }
    };

    const handleKisiSil = (id) => {
        if (window.confirm("Bu kişiyi silmek istediğinizden emin misiniz?")) {
            api.kisiSil(id);
        }
    };
    
    const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="24" height="24" fill="currentColor"><path d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C378.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3zM609.3 512H471.4c5.4-9.4 8.6-20.3 8.6-32v-8c0-60.7-27.1-115.2-69.8-151.8c2.4-.2 4.7-.3 7.1-.3h64c11.9 0 23.7 1.2 35.4 3.4c21.2 3.9 40.1 11.4 54.8 21.2c16.1 10.6 29.5 24.3 39.6 40.1c11 17.2 16.5 36.6 16.5 56.8v8c0 16.4-13.3 29.7-29.7 29.7zM480 256a96 96 0 1 1 128 0 96 96 0 1 1 -128 0z"/></svg>;


    return (
        <div id="kisi-yonetim-paneli">
            <div className="workspace-header">
                <h2><UsersIcon />Kişi Yönetimi</h2>
                <button className="btn btn-secondary" onClick={onKapat}>&larr; Ana Ekrana Dön</button>
            </div>
            <hr />
            <div className="kisi-yonetim-alani">
                <div>
                    <h4>Mevcut Kişiler</h4>
                    <ul id="kisi-listesi-yonetim">
                        {kisiler && kisiler.length > 0 ? (
                            kisiler.map(kisi => (
                                <li key={kisi.id}>
                                    <span>{kisi.adSoyad}</span>
                                    <button className="btn btn-danger kisi-sil-btn" onClick={() => handleKisiSil(kisi.id)}>Sil</button>
                                </li>
                            ))
                        ) : (
                            <li>Henüz kişi eklenmedi.</li>
                        )}
                    </ul>
                </div>
                <div>
                    <h4 style={{ marginTop: '30px' }}>Yeni Kişi Ekle</h4>
                    <form id="kisi-ekle-formu" onSubmit={handleKisiEkle}>
                        <label htmlFor="yeni-kisi-ad">Yeni Kişinin Adı Soyadı:</label>
                        <input
                            type="text"
                            id="yeni-kisi-ad"
                            placeholder="Ad Soyad"
                            value={yeniKisi}
                            onChange={(e) => setYeniKisi(e.target.value)}
                            required
                        />
                        <button type="submit" className="btn btn-primary">Kişiyi Ekle</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default KisiYonetimi;
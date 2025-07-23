import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';

const Ayarlar = ({ onKapat }) => {
    const [ayarlar, setAyarlar] = useState({
        host: '',
        port: '',
        user: '',
        pass: '',
        to: '',
    });
    const [isPassSet, setIsPassSet] = useState(false);
    const [mesaj, setMesaj] = useState({ metin: '', tip: '' });

    useEffect(() => {
        const fetchAyarlar = async () => {
            const mevcutAyarlar = await api.ayarlariGetir();
            setAyarlar(prev => ({ ...prev, ...mevcutAyarlar }));
            setIsPassSet(mevcutAyarlar.isPassSet);
        };
        fetchAyarlar();
    }, []);

    const handleChange = (e) => {
        setAyarlar({ ...ayarlar, [e.target.name]: e.target.value });
    };

    const handleKaydet = async (e) => {
        e.preventDefault();
        const result = await api.ayarlariKaydet(ayarlar);
        setMesaj({ metin: result.message, tip: result.success ? 'success' : 'error' });
        // Şifre alanını temizle ve güncel durumu tekrar al
        setAyarlar(prev => ({ ...prev, pass: '' }));
        const guncelAyarlar = await api.ayarlariGetir();
        setIsPassSet(guncelAyarlar.isPassSet);
    };

    const handleTestEt = async () => {
        setMesaj({ metin: 'Test e-postası gönderiliyor...', tip: 'info' });
        const result = await api.testEmailGonder();
        setMesaj({ metin: result.message, tip: result.success ? 'success' : 'error' });
    };
    
    const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="24" height="24" fill="currentColor"><path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9.9 15.9-19.4 15.9H184c-9.6 0-17.4-6.8-19.4-15.9l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L52.4 466.1c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C17.2 241.1 16.6 232.6 16.6 224s.6-17.1 1.7-25.4L15 159.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9.9-15.9 19.4-15.9h96c9.6 0 17.4 6.8 19.4 15.9l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6 .3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"/></svg>;


    return (
        <div>
            <div className="workspace-header">
                <h2><SettingsIcon />E-posta Ayarları</h2>
                <button className="btn btn-secondary" onClick={onKapat}>&larr; Geri Dön</button>
            </div>
            <hr />
            <form onSubmit={handleKaydet}>
                <label htmlFor="host">SMTP Sunucusu (Host):</label>
                <input type="text" id="host" name="host" value={ayarlar.host} onChange={handleChange} placeholder="örn: smtp.gmail.com" required />

                <label htmlFor="port">Port:</label>
                <input type="number" id="port" name="port" value={ayarlar.port} onChange={handleChange} placeholder="örn: 587 veya 465" required />

                <label htmlFor="user">Kullanıcı Adı (E-posta):</label>
                <input type="email" id="user" name="user" value={ayarlar.user} onChange={handleChange} placeholder="e-posta@adresiniz.com" required />

                <label htmlFor="pass">Şifre / Uygulama Şifresi:</label>
                <input type="password" id="pass" name="pass" value={ayarlar.pass} onChange={handleChange} placeholder={isPassSet ? 'Yeni şifre girmek için doldurun' : 'Şifrenizi girin'} />

                <label htmlFor="to">Alıcı E-posta Adresi:</label>
                <input type="email" id="to" name="to" value={ayarlar.to} onChange={handleChange} placeholder="hatirlatma-maili-alacak-adres@example.com" required />

                {mesaj.metin && (
                    <div style={{
                        padding: '10px',
                        margin: '10px 0',
                        borderRadius: '5px',
                        color: 'white',
                        backgroundColor: mesaj.tip === 'success' ? '#28a745' : (mesaj.tip === 'error' ? '#dc3545' : '#17a2b8')
                    }}>
                        {mesaj.metin}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button type="submit" className="btn btn-primary">Ayarları Kaydet</button>
                    <button type="button" className="btn btn-secondary" onClick={handleTestEt}>Ayarları Test Et</button>
                </div>
            </form>
        </div>
    );
};

export default Ayarlar;
import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import EtiketInput from '../EtiketInput/EtiketInput'; // Etiket bileşenini import et

const YeniFirma = ({ firma, tumEtiketler }) => {
    const [id, setId] = useState(null);
    const [unvan, setUnvan] = useState('');
    const [vergiNo, setVergiNo] = useState('');
    const [etiketler, setEtiketler] = useState([]); // Firma etiketleri için state
    const [isEditing, setIsEditing] = useState(false);
    
    useEffect(() => {
        if (firma) {
            setId(firma.id);
            setUnvan(firma.unvan);
            setVergiNo(firma.vergiNo);
            setEtiketler(firma.tags || []); // Mevcut etiketleri yükle
            setIsEditing(true);
        } else {
            setId(null);
            setUnvan('');
            setVergiNo('');
            setEtiketler([]); // Formu temizlerken etiketleri de temizle
            setIsEditing(false);
        }
    }, [firma]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const firmaData = { id, unvan, vergiNo, tags: etiketler }; // Veriye etiketleri ekle

        if (isEditing) {
            const result = await api.firmaGuncelle(firmaData);
            if (result.success) {
                alert(result.message);
            } else {
                alert(result.message);
            }
        } else {
            api.yeniFirmaKaydet(firmaData);
            alert(`Firma "${unvan}" başarıyla eklendi.`);
            setUnvan('');
            setVergiNo('');
            setEtiketler([]); // Formu temizle
        }
    };

    const icon = isEditing
        ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="24" height="24" fill="currentColor"><path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.8-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z"/></svg>
        : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="24" height="24" fill="currentColor"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/></svg>;


    return (
        <div id="yeni-firma-alani">
            <h2 id="firma-form-baslik">{icon}{isEditing ? 'Firma Bilgilerini Güncelle' : 'Yeni Firma Ekle'}</h2>
            <form id="firma-formu" onSubmit={handleSubmit}>
                <input type="hidden" id="duzenlenen-firma-id" value={id || ''} readOnly />
                
                <label htmlFor="firma-unvan">Firma Ünvanı:</label>
                <input
                    type="text"
                    id="firma-unvan"
                    value={unvan}
                    onChange={(e) => setUnvan(e.target.value)}
                    required
                />
                
                <label htmlFor="vergi-no">Vergi Numarası:</label>
                <input
                    type="text"
                    id="vergi-no"
                    value={vergiNo}
                    onChange={(e) => setVergiNo(e.target.value)}
                    required
                />

                <label htmlFor="firma-etiketler">Etiketler:</label>
                <EtiketInput 
                    mevcutEtiketler={etiketler}
                    setMevcutEtiketler={setEtiketler}
                    onerilenEtiketler={tumEtiketler}
                />
                
                <button type="submit" className="btn btn-primary" id="firma-kaydet-btn" style={{marginTop: '20px'}}>
                    {isEditing ? 'Bilgileri Güncelle' : 'Firmayı Kaydet'}
                </button>
            </form>
        </div>
    );
};

export default YeniFirma;
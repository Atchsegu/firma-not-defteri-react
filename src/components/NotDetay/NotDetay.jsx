import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../../services/api';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
    ClassicEditor, Alignment, Autoformat, BlockQuote, Bold, Essentials,
    FontBackgroundColor, FontColor, FontFamily, FontSize, Heading, Highlight,
    HorizontalLine, ImageInsertViaUrl, Indent, Italic, Link, List, Paragraph,
    PasteFromOffice, RemoveFormat, Table, TableToolbar, TextTransformation, Underline
} from 'ckeditor5';
import EtiketInput from '../EtiketInput/EtiketInput';
import './NotDetay.css';

const NotDetay = ({ not, belgeler, onGeriDon, setBelgeler, tumEtiketler }) => {
    const [notIcerikBloklari, setNotIcerikBloklari] = useState([]);
    const [aktifEditorIcerik, setAktifEditorIcerik] = useState('');
    const [aktifBlokEtiketleri, setAktifBlokEtiketleri] = useState([]);
    const [aktifBlokSonTarih, setAktifBlokSonTarih] = useState('');
    const [aktifDuzenlenenBlokId, setAktifDuzenlenenBlokId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [renameData, setRenameData] = useState({ id: null, ad: '' });
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (not && Array.isArray(not.notIcerik)) {
            setNotIcerikBloklari(not.notIcerik);
        } else {
            setNotIcerikBloklari([]);
        }
        handleYeniNotBlok();
    }, [not]);

    const editorConfiguration = {
        plugins: [
            Alignment, Autoformat, BlockQuote, Bold, Essentials, FontBackgroundColor,
            FontColor, FontFamily, FontSize, Heading, Highlight, HorizontalLine,
            ImageInsertViaUrl, Indent, Italic, Link, List, Paragraph,
            PasteFromOffice, RemoveFormat, Table, TableToolbar, TextTransformation,
            Underline
        ],
        toolbar: {
            items: [
                'heading', '|', 'fontSize', 'fontFamily', '|',
                'fontColor', 'fontBackgroundColor', 'highlight', '|',
                'bold', 'italic', 'underline', 'link', '|',
                'alignment', '|', 'numberedList', 'bulletedList', 'outdent', 'indent', '|',
                'insertTable', 'blockQuote', 'horizontalLine', '|',
                'removeFormat', 'undo', 'redo'
            ],
            shouldNotGroupWhenFull: true
        },
        table: { contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'] },
        // DÜZELTME: licenseKey değerini çalışan versiyondaki gibi 'GPL' yapıyoruz.
        licenseKey: 'GPL', 
    };

    const handleKaydet = useCallback(async () => {
        let guncelBloklar = [...notIcerikBloklari];
        
        if (aktifDuzenlenenBlokId) {
            const blokIndex = guncelBloklar.findIndex(b => b.id === aktifDuzenlenenBlokId);
            if (blokIndex > -1) {
                if (!aktifEditorIcerik || aktifEditorIcerik.trim() === '' || aktifEditorIcerik === '<p>&nbsp;</p>') {
                    guncelBloklar.splice(blokIndex, 1);
                } else {
                    guncelBloklar[blokIndex].content = aktifEditorIcerik;
                    guncelBloklar[blokIndex].tags = aktifBlokEtiketleri;
                    guncelBloklar[blokIndex].sonTarih = aktifBlokSonTarih;
                }
            }
        } 
        else if (aktifEditorIcerik && aktifEditorIcerik.trim() !== '' && aktifEditorIcerik !== '<p>&nbsp;</p>') {
            const yeniBlok = {
                id: Date.now(),
                content: aktifEditorIcerik,
                tags: aktifBlokEtiketleri,
                sonTarih: aktifBlokSonTarih,
            };
            guncelBloklar.push(yeniBlok);
        }

        const sonuc = await api.notIcerikKaydet({ notId: not.id, icerikBloklari: guncelBloklar });
        if (sonuc.success) {
            setNotIcerikBloklari(guncelBloklar);
            handleYeniNotBlok();
        } else {
            alert(sonuc.message);
        }
    }, [not.id, aktifEditorIcerik, aktifDuzenlenenBlokId, notIcerikBloklari, aktifBlokEtiketleri, aktifBlokSonTarih]);
    
    useEffect(() => {
        const kaydetCallback = () => handleKaydet();
        const removeListener = api.onNotKaydetRequest(kaydetCallback);
        return () => {
            if(removeListener && typeof removeListener.remove === 'function') {
                removeListener.remove();
            }
        };
    }, [handleKaydet]);

    const handleBlokDuzenle = (blok) => {
        setAktifDuzenlenenBlokId(blok.id);
        setAktifEditorIcerik(blok.content);
        setAktifBlokEtiketleri(blok.tags || []);
        setAktifBlokSonTarih(blok.sonTarih || '');
    };

    const handleYeniNotBlok = () => {
        setAktifDuzenlenenBlokId(null);
        setAktifEditorIcerik('');
        setAktifBlokEtiketleri([]);
        setAktifBlokSonTarih('');
    };
    
    const handleBelgeEkle = async () => {
        const guncelBelgeler = await api.belgeEkle(not.id);
        setBelgeler(guncelBelgeler);
    };

    const handleBelgeSil = async (belgeId) => {
        if (window.confirm("Bu belgeyi kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
            const sonuc = await api.belgeSil(belgeId);
            if (sonuc.success) {
                setBelgeler(belgeler.filter(b => b.id !== belgeId));
            } else {
                alert(sonuc.message || 'Belge silinemedi.');
            }
        }
    };

    const handleBelgeRename = async (e) => {
        e.preventDefault();
        if (renameData.ad && renameData.ad.trim() !== '') {
            const sonuc = await api.belgeYenidenAdlandir({ notId: not.id, belgeId: renameData.id, yeniAd: renameData.ad });
            if (sonuc.success) {
                const guncelDetay = await api.getNotDetay(not.id);
                setBelgeler(guncelDetay.belgeler);
            } else {
                alert(sonuc.message || 'Belge yeniden adlandırılamadı.');
            }
        }
        setIsModalOpen(false);
    };
    
    const openRenameModal = (belge) => {
        setRenameData({ id: belge.id, ad: belge.orjinalAd });
        setIsModalOpen(true);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFiles = [...e.dataTransfer.files].map(file => file.path);
        if (droppedFiles.length > 0) {
            const guncelBelgeler = await api.belgeSurukleBirak({ notId: not.id, filePaths: droppedFiles });
            setBelgeler(guncelBelgeler);
        }
    };
    
    const renderNotBlok = (blok) => {
        const html = blok.content.replace(/\[\[doc:(\d+)\|(.+?)\]\]/g, (match, docId, docName) => {
            const belge = belgeler.find(b => b.id === parseInt(docId));
            if (belge) {
                const onclickAction = `window.api.belgeAc('${belge.dosyaYolu.replace(/\\/g, '\\\\')}')`;
                return `<a href="#" onclick="${onclickAction}">${docName}</a>`;
            }
            return `<span style="color: red; text-decoration: line-through;" title="Belge ID:${docId} bulunamadı">${docName}</span>`;
        });
        return { __html: html };
    };

    if (!not) return null;

    return (
        <div id="not-calisma-alani">
            <div className="workspace-header">
                <div className="workspace-header-title">
                    <h2 id="not-baslik">{`${not.firmaUnvan || 'Kişisel Not'} / ${not.tur}`}</h2>
                    <p id="not-detay-bilgisi">
                        Dönem: {not.donem} | Tarih: {new Date(not.notTarihi).toLocaleDateString('tr-TR')} | Notu Alan: {not.notuAlan}
                    </p>
                </div>
                <button id="geri-don-btn" className="btn btn-secondary" onClick={onGeriDon}>&larr; Geri Dön</button>
            </div>
            <hr />
            <div className="workspace-layout">
                <div className="note-container">
                    <h3>
                        {aktifDuzenlenenBlokId ? 'Not Bloğunu Düzenle' : 'Yeni Not Bloğu Ekle'}
                    </h3>
                    <CKEditor
                        editor={ClassicEditor}
                        config={editorConfiguration}
                        data={aktifEditorIcerik}
                        onChange={(event, editor) => setAktifEditorIcerik(editor.getData())}
                    />
                    
                    <div className="blok-meta-yonetim">
                         <div className="blok-son-tarih">
                            <label htmlFor="blok-son-tarih">Son Tarih (Hatırlatıcı):</label>
                            <input
                                type="date"
                                id="blok-son-tarih"
                                value={aktifBlokSonTarih}
                                onChange={(e) => setAktifBlokSonTarih(e.target.value)}
                            />
                         </div>
                         <div className="blok-etiket-yonetim">
                             <label>Etiketler:</label>
                             <EtiketInput
                                mevcutEtiketler={aktifBlokEtiketleri}
                                setMevcutEtiketler={setAktifBlokEtiketleri}
                                onerilenEtiketler={tumEtiketler}
                                placeholder="Bu blok için etiket ekleyin..."
                             />
                         </div>
                    </div>

                    <div className="editor-actions">
                        <button className="btn btn-primary" onClick={handleKaydet}>
                            {aktifDuzenlenenBlokId ? 'Değişiklikleri Kaydet' : 'Not Bloğunu Kaydet'} (Ctrl+S)
                        </button>
                        {aktifDuzenlenenBlokId && (
                             <button className="btn btn-secondary" onClick={handleYeniNotBlok}>
                                 Yeni Blok Ekle
                             </button>
                        )}
                    </div>
                    
                    <h4>Kaydedilmiş Not Blokları</h4>
                    <div className="not-bloklari-container">
                        {notIcerikBloklari.length > 0 ? (
                            notIcerikBloklari.map(blok => (
                                <div 
                                    key={blok.id}
                                    className={`not-blogu-wrapper ${aktifDuzenlenenBlokId === blok.id ? 'editing' : ''}`}
                                    onClick={() => handleBlokDuzenle(blok)}
                                >
                                    {blok.sonTarih && (
                                        <div className="blok-son-tarih-gostergesi">
                                            <strong>Son Tarih:</strong> {new Date(blok.sonTarih).toLocaleDateString('tr-TR')}
                                        </div>
                                    )}
                                    <div 
                                        className="not-blogu-icerik"
                                        dangerouslySetInnerHTML={renderNotBlok(blok)}
                                    />
                                    {blok.tags && blok.tags.length > 0 && (
                                        <div className="etiket-listesi blok-etiket-listesi">
                                            {blok.tags.map(tag => <span key={tag} className="etiket">{tag}</span>)}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="blok-yok-mesaji">Henüz kaydedilmiş bir not bloğu yok.</p>
                        )}
                    </div>
                </div>
                <div 
                    className={`document-container ${isDragging ? 'dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <h3>İlişkili Belgeler</h3>
                    <div className="drop-indicator">
                        {isDragging ? 'Dosyaları Buraya Bırakın' : 'Dosyaları sürükleyip buraya bırakabilirsiniz'}
                    </div>
                    <ul id="belge-listesi">
                        {belgeler && belgeler.length > 0 ? (
                            belgeler.map(belge => (
                                <li key={belge.id}>
                                    <a href="#" className="belge-adi" onClick={(e) => { e.preventDefault(); api.belgeAc(belge.dosyaYolu); }}>
                                        {belge.orjinalAd}
                                    </a>
                                    <div className="belge-aksiyonlari">
                                        <button className="klasor-ac-btn" title="Bulunduğu Klasörü Aç" onClick={() => api.klasorAc(belge.dosyaYolu)}>📂</button>
                                        <button className="belge-rename-btn" title="Yeniden Adlandır" onClick={() => openRenameModal(belge)}>✏️</button>
                                        <button className="belge-sil-btn" title="Sil" onClick={() => handleBelgeSil(belge.id)}>🗑️</button>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li>Henüz belge eklenmedi.</li>
                        )}
                    </ul>
                    <button id="belge-ekle-btn" className="btn btn-primary btn-full-width" onClick={handleBelgeEkle}>Belge Ekle...</button>
                </div>
            </div>

            {isModalOpen && (
                <div id="rename-modal-overlay" className="modal-overlay">
                    <div className="modal-content">
                        <h3>Belgeyi Yeniden Adlandır</h3>
                        <form onSubmit={handleBelgeRename}>
                            <input type="hidden" id="rename-modal-belge-id" value={renameData.id} />
                            <label htmlFor="rename-modal-input">Yeni Belge Adı:</label>
                            <input 
                                type="text" 
                                id="rename-modal-input"
                                value={renameData.ad}
                                onChange={(e) => setRenameData({...renameData, ad: e.target.value})}
                                autoFocus
                            />
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>İptal</button>
                                <button type="submit" className="btn btn-primary">Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotDetay;
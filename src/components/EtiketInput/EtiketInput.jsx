import React, { useState } from 'react';
import './EtiketInput.css';

const EtiketInput = ({ mevcutEtiketler, setMevcutEtiketler, onerilenEtiketler, placeholder = "Etiket ekleyin..." }) => {
    const [inputValue, setInputValue] = useState('');

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const yeniEtiket = inputValue.trim();

            if (yeniEtiket && !mevcutEtiketler.includes(yeniEtiket)) {
                setMevcutEtiketler([...mevcutEtiketler, yeniEtiket]);
            }
            setInputValue('');
        }
    };

    const handleEtiketSil = (etiketToRemove) => {
        setMevcutEtiketler(mevcutEtiketler.filter(etiket => etiket !== etiketToRemove));
    };

    return (
        <div className="etiket-input-container">
            {mevcutEtiketler.map((etiket, index) => (
                <div key={index} className="etiket">
                    {etiket}
                    <button type="button" onClick={() => handleEtiketSil(etiket)}>&times;</button>
                </div>
            ))}
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                list="onerilen-etiketler"
            />
            {onerilenEtiketler && onerilenEtiketler.length > 0 && (
                <datalist id="onerilen-etiketler">
                    {onerilenEtiketler.map((etiket, index) => (
                        <option key={index} value={etiket} />
                    ))}
                </datalist>
            )}
        </div>
    );
};

export default EtiketInput;
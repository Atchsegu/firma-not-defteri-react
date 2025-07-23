const { registerAramaHandlers } = require('./arama.handler.js');
const { registerBelgeHandlers } = require('./belge.handler.js');
const { registerFirmaHandlers } = require('./firma.handler.js');
const { registerKisiHandlers } = require('./kisi.handler.js');
const { registerNotHandlers } = require('./not.handler.js');
const { registerEtiketHandlers } = require('./etiket.handler.js');
const { registerAyarlarHandlers } = require('./ayarlar.handler.js'); // YENİ EKLENDİ

function registerIpcHandlers() {
    registerFirmaHandlers();
    registerNotHandlers();
    registerKisiHandlers();
    registerBelgeHandlers();
    registerAramaHandlers();
    registerEtiketHandlers();
    registerAyarlarHandlers(); // YENİ EKLENDİ
}

module.exports = {
    registerIpcHandlers
};
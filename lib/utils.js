'use strict';

const crypto = require('crypto');

/**
 * @description encrypts an integration key
 * @param {String} key
 * @returns {String} 
 */
function encryptKey(key) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', process.env.ENCRYPTION_SECRET, iv);
    let encrypted = cipher.update(key);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * @description decrypts an integration key
 * @param {String} key
 * @returns {String}
 */
function decryptKey(key) {
    const textParts = key.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', process.env.ENCRYPTION_SECRET, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

module.exports = {
    encryptKey,
    decryptKey
}
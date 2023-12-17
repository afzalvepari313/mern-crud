const CryptoJS = require('crypto-js');
const SecretKey = process.env.PUBLIC_KEY;


// encryptionDecryption.js
const encryptField = (value) => {
  try {
    return CryptoJS.AES.encrypt(value, SecretKey).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Encryption failed');
  }
};

const decryptField = (encryptedValue) => {
  try {
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedValue, SecretKey);
    const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);

    // Check if the decrypted data is valid UTF-8 text
    if (decryptedData === '') {
      const decryptedBinaryData = decryptedBytes.toString(CryptoJS.enc.Base64);
      return decryptedBinaryData;
    }
    return decryptedData;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Decryption failed');
  }
};
// Function to decrypt file content
const decryptFile = (encryptedBuffer) => {
  const decryptedContent = CryptoJS.AES.decrypt(encryptedBuffer.toString(), 'your-file-encryption-key');
  return Buffer.from(decryptedContent.toString(CryptoJS.enc.Utf8));
};

module.exports = {
  encryptField,
  decryptField,
  decryptFile
};

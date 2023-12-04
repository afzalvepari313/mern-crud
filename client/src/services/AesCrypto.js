import CryptoJS from 'crypto-js';
export const SecretKey= import.meta.env.VITE_PUBLIC_KEY;
// Helper function for encrypting a data 
export const encryptField = (value) => {
    return CryptoJS.AES.encrypt(value, SecretKey).toString();
  };

  // Helper function for decrypting a data
  export const decryptField = (encryptedValue) => {
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

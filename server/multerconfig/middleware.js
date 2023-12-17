const { encryptField, decryptField, decryptFile } = require('../utils/aesEncryptin');


const decryptData = (req, res, next) => {
    try {
        const encryptedFormData = req.body.encryptedFormData;

        if (!encryptedFormData) {
            throw new Error('Encrypted form data is missing');
        }

        // Decrypt the received data
        const decryptedDataString = decryptField(encryptedFormData);

        if (!decryptedDataString) {
            throw new Error('Decrypted data is empty');
        }

        const decryptedData = JSON.parse(decryptedDataString);
        console.log('Middleware is working! Decrypted Data');
        const{user_profile, ...user}= decryptedData;
        req.decryptedData = { user, user_profile };
        next();
    } catch (error) {
        console.error('Error in decrypting data:', error);
        res.status(400).json({ message: 'Invalid encrypted data' });
    }
};

module.exports = { decryptData };
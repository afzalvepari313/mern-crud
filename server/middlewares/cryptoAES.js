const crypto = require('crypto-js');
const SecretKey = process.env.PUBLIC_KEY;

const encryptUserData = (req, res, next) => {
  try {
    if (req.body) {
      const userData = req.body;
      const userDataString = JSON.stringify(userData);

      // Using a random IV (Initialization Vector) for better security
      const iv = crypto.lib.WordArray.random(16);
      const cipherText = crypto.AES.encrypt(userDataString, crypto.enc.Hex.parse(SecretKey), { iv }).ciphertext;

      // Combine the IV and ciphertext and convert to base64 for transmission
      const encryptedData = iv.concat(cipherText).toString(crypto.enc.Base64);

      console.log('Encrypted Data:', encryptedData);
      req.body = { data: encryptedData };
      console.log('Request Body in Middleware:', req.body);
    }
    next();
  } catch (error) {
    console.error('User data encryption error:', error);
    res.status(500).send('Error encrypting user data');
  }
};

const decryptUserData = (encryptedData) => {
  try {
    // Decode the base64 string and separate the IV and ciphertext
    const rawData = crypto.enc.Base64.parse(encryptedData);
    const iv = crypto.lib.WordArray.create(rawData.words.slice(0, 4));
    const ciphertext = crypto.lib.WordArray.create(rawData.words.slice(4));

    // Decrypt the data using the encryption key and IV
    const decryptedData = crypto.AES.decrypt({ ciphertext }, crypto.enc.Hex.parse(SecretKey), { iv }).toString(crypto.enc.Utf8);

    return JSON.parse(decryptedData);
  } catch (error) {
    console.error('User data decryption error:', error);
    throw new Error('Error decrypting user data');
  }
};

module.exports = {
  encryptUserData,
  decryptUserData,
};

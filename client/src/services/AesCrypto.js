import CryptoJS from 'crypto-js';
export const SecretKey = import.meta.env.VITE_PUBLIC_KEY;
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

// readImage function
export const readImageAsBase64 = (image) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const imageDataString = reader.result.split(',')[1];
      resolve(imageDataString);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsDataURL(image);
  });
};

//encryptImage function
export const encryptImage = async (image) => {
  try {
    const reader = new FileReader();
    const binaryString = await new Promise((resolve, reject) => {
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read image file'));
      };
      reader.readAsBinaryString(image);
    });

    const wordArray = CryptoJS.enc.Utf8.parse(binaryString); 
    const encryptedWordArray = CryptoJS.AES.encrypt(wordArray, SecretKey);
    const encryptedBinaryString = encryptedWordArray.toString(CryptoJS.enc.Base64);
    return encryptedBinaryString;
  } catch (error) {
    console.error('Encryption error:', error);
    return null; // Handle the error appropriately
  }
};

//decryptImage function
export const decryptImage = (encryptedImage) => {
  const encryptedWordArray = CryptoJS.enc.Base64.parse(encryptedImage);
  const decryptedWordArray = CryptoJS.AES.decrypt(encryptedWordArray, SecretKey);
  const binaryString = decryptedWordArray.toString(CryptoJS.enc.Utf8);
  const blob = new Blob([binaryString], { type: 'image/png' }); // Replace 'image/png' with the appropriate image type
  const url = URL.createObjectURL(blob);
  return url;
};


// Function to decrypt file content
export const decryptFile = (encryptedBlob) => {
  const fileReader = new FileReader();

  return new Promise((resolve) => {
    fileReader.onload = (event) => {
      const decryptedContent = CryptoJS.AES.decrypt(event.target.result, SecretKey);
      resolve(new Blob([decryptedContent], { type: encryptedBlob.type }));
    };

    fileReader.readAsText(encryptedBlob);
  });
};
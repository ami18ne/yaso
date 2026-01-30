
const https = require('https');

const APP_URL = 'https://yaso-app.onrender.com';

const ping = () => {
  console.log(`Pinging ${APP_URL} to keep it alive...`);
  
  https.get(APP_URL, (res) => {
    if (res.statusCode >= 200 && res.statusCode < 400) {
      console.log(`Ping successful! Status: ${res.statusCode}. App is awake.`);
    } else {
      console.warn(`Ping resulted in a non-OK status: ${res.statusCode}`);
    }
  }).on('error', (err) => {
    console.error('Error pinging the app:', err.message);
  });
};

ping();

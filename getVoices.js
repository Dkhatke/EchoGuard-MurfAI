const axios = require('axios');
require('dotenv').config({ path: __dirname + '/.env' });

const apiKey = process.env.MURF_API_KEY;

if (!apiKey) {
    console.error(' API key not found in environment variables.');
    process.exit(1);
}
axios.get('https://api.murf.ai/v1/speech/voices', {
    headers: {
        'api-key': apiKey
    }
})
.then(response => {
    console.log('--- Available Voices ---');
    console.log(JSON.stringify(response.data, null, 2));
})
.catch(error => {
    console.error('Error fetching voices:', error.response ? error.response.data : error.message);
});

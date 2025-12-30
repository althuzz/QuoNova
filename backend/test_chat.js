const http = require('http');

const data = JSON.stringify({
    message: 'Hello'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/chat',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(body);
            console.log('Provider:', json.provider);
            if (json.provider === 'mock-ai') {
                console.log('Vercel SDK failed or key rejected. Fallback active.');
                // If json.response contains error details, print them
                if (json.response && json.response.includes && json.response.includes("error")) {
                    console.log("Error details:", json.response);
                }
            } else {
                console.log('Vercel SDK worked! Response:', json.response);
            }
        } catch (e) {
            console.error('Error parsing response:', e);
            console.log('Raw body:', body);
        }
    });
});

req.on('error', (error) => {
    console.error('Request failed:', error);
});

req.write(data);
req.end();

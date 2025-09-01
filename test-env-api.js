const apiKey = 'AIzaSyCnNh6yN5Gn5VukRjMM7M20fy2KyRAvmIs';
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

fetch(apiUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: 'Hello, test message' }] }]
  })
}).then(async res => {
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Response:', text.substring(0, 500));
}).catch(err => console.error('Error:', err));

const path = require('path');
const http = require('http');

const url = 'http://localhost:3001/api/subjects/chapters/125/mcqs?lessonId=941&limit=5';

http.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    } catch (e) {
      console.log('Raw data:', data);
    }
  });
}).on('error', (err) => {
  console.error('Error calling API:', err.message);
});

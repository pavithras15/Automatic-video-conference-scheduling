const express = require('express');
const path = require('path');
const app = express();

// Serve HR form at /hr-form
app.get('/hr-form', (req, res) => {
  res.sendFile(path.join(__dirname, 'hr-form.html'));
});

// Serve participant slot selection at /select-availability
app.get('/select-availability', (req, res) => {
  res.sendFile(path.join(__dirname, 'select-availability.html'));
});

// Serve the dashboard static HTML
app.use('/', express.static(__dirname));

// Proxy API requests to backend
app.use('/api', (req, res) => {
  const http = require('http');
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: req.originalUrl,
    method: req.method,
    headers: req.headers
  };
  const proxy = http.request(options, function (response) {
    res.writeHead(response.statusCode, response.headers);
    response.pipe(res, { end: true });
  });
  req.pipe(proxy, { end: true });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Dashboard frontend running at http://localhost:${PORT}`);
});

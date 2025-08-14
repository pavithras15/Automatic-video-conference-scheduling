require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const callsRouter = require('./routes/calls');

const googleRouter = require('./routes/google');
const googleEventRouter = require('./routes/googleEvent');
const dashboardRouter = require('./routes/dashboard');
const slotsRouter = require('./routes/slots');

app.use(bodyParser.json());
app.use('/api/calls', callsRouter);
app.use('/api/google', googleRouter);
app.use('/api/google', googleEventRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/slots', slotsRouter);

app.get('/', (req, res) => {
  res.send('AI Agent Scheduler Backend is running.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


const { createCallsTable } = require('./src/models/call');
const { createLogsTable } = require('./src/models/callLogs');
const { createSlotsTables } = require('./src/models/slots');

(async () => {
  try {
  await createCallsTable();
  await createLogsTable();
  await createSlotsTables();
  console.log('Database setup complete.');
    process.exit(0);
  } catch (err) {
    console.error('Database setup failed:', err);
    process.exit(1);
  }
})();

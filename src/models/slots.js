const pool = require('./db');

// Create slots and responses tables
const createSlotsTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS call_slots (
      id SERIAL PRIMARY KEY,
      call_id INTEGER REFERENCES calls(id),
      slot TIMESTAMP NOT NULL
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS slot_responses (
      id SERIAL PRIMARY KEY,
      slot_id INTEGER REFERENCES call_slots(id),
      participant_email VARCHAR(255),
      available BOOLEAN,
      responded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

const addProposedSlots = async (call_id, slots) => {
  const results = [];
  for (const slot of slots) {
    const result = await pool.query(
      'INSERT INTO call_slots (call_id, slot) VALUES ($1, $2) RETURNING *',
      [call_id, slot]
    );
    results.push(result.rows[0]);
  }
  return results;
};

const getSlotsForCall = async (call_id) => {
  const result = await pool.query('SELECT * FROM call_slots WHERE call_id = $1', [call_id]);
  return result.rows;
};

const addSlotResponse = async (slot_id, participant_email, available) => {
  await pool.query(
    'INSERT INTO slot_responses (slot_id, participant_email, available) VALUES ($1, $2, $3)',
    [slot_id, participant_email, available]
  );
};

const getResponsesForSlot = async (slot_id) => {
  const result = await pool.query('SELECT * FROM slot_responses WHERE slot_id = $1', [slot_id]);
  return result.rows;
};

module.exports = {
  createSlotsTables,
  addProposedSlots,
  getSlotsForCall,
  addSlotResponse,
  getResponsesForSlot
};

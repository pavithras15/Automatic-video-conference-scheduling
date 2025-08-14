// Call model: represents a scheduled call
// For simplicity, using SQL directly. You can migrate to ORM later if needed.

const pool = require('./db');

const createCallsTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS calls (
      id SERIAL PRIMARY KEY,
      recruiter_name VARCHAR(100),
      recruiter_email VARCHAR(100),
      candidate_name VARCHAR(100),
      candidate_email VARCHAR(100),
      expert_name VARCHAR(100),
      expert_email VARCHAR(100),
      call_type VARCHAR(50),
      duration INTEGER,
      deadline TIMESTAMP,
      status VARCHAR(50) DEFAULT 'pending',
      scheduled_time TIMESTAMP,
      meet_link TEXT,
      agenda TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

module.exports = { createCallsTable };

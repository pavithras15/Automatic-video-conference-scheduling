const pool = require('./db');

const logCallRequest = async (data) => {
  const {
    recruiter_name, recruiter_email,
    candidate_name, candidate_email,
    expert_name, expert_email,
    call_type, duration, deadline
  } = data;
  const result = await pool.query(
    `INSERT INTO calls (recruiter_name, recruiter_email, candidate_name, candidate_email, expert_name, expert_email, call_type, duration, deadline)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [recruiter_name, recruiter_email, candidate_name, candidate_email, expert_name, expert_email, call_type, duration, deadline]
  );
  return result.rows[0];
};

const getAllCalls = async () => {
  const result = await pool.query('SELECT * FROM calls ORDER BY created_at DESC');
  return result.rows;
};

module.exports = { logCallRequest, getAllCalls };

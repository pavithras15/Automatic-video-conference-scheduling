const pool = require('./db');

const createLogsTable = async () => {
	await pool.query(`
		CREATE TABLE IF NOT EXISTS call_logs (
			id SERIAL PRIMARY KEY,
			call_id INTEGER REFERENCES calls(id),
			action VARCHAR(100),
			status VARCHAR(50),
			message TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`);
};

const logAction = async (call_id, action, status, message) => {
	await pool.query(
		`INSERT INTO call_logs (call_id, action, status, message) VALUES ($1, $2, $3, $4)` ,
		[call_id, action, status, message]
	);
};

const getLogsForCall = async (call_id) => {
	const result = await pool.query('SELECT * FROM call_logs WHERE call_id = $1 ORDER BY created_at', [call_id]);
	return result.rows;
};

const getAllLogs = async () => {
	const result = await pool.query('SELECT * FROM call_logs ORDER BY created_at DESC');
	return result.rows;
};

module.exports = { createLogsTable, logAction, getLogsForCall, getAllLogs };

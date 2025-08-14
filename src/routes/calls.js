const express = require('express');
const router = express.Router();



const { logCallRequest, getAllCalls } = require('../models/callActions');
const { logAction } = require('../models/callLogs');
const { oAuth2Client, createCalendarEvent } = require('../services/google');
const { addProposedSlots } = require('../models/slots');
const { sendMail } = require('../services/email');

// POST /api/calls - Trigger scheduling
router.post('/', async (req, res) => {
  let call = null;
  let attendees = [];
  try {
    // 1. Log the call request
    call = await logCallRequest(req.body);
    await logAction(call.id, 'Call request received', 'success', 'Call request logged in DB');

    // Prevent duplicate poll emails for the same call
    const pool = require('../models/db');
    const pollAlreadySent = async () => {
      const result = await pool.query('SELECT * FROM call_logs WHERE call_id = $1 AND action = $2', [call.id, 'Availability poll sent']);
      return result.rows.length > 0;
    };
    if (await pollAlreadySent()) {
      await logAction(call.id, 'Duplicate poll prevented', 'info', 'Attempted to send poll emails again, but poll already sent.');
      return res.status(200).json({ message: 'Poll already sent for this call.', call });
    }

    // 2. Prepare event details
    const { recruiter_name, recruiter_email, candidate_name, candidate_email, expert_name, expert_email, call_type, duration, deadline } = req.body;
    const summary = `${call_type.charAt(0).toUpperCase() + call_type.slice(1)} Interview`;
    const description = `Automated scheduling for ${call_type} interview. Participants: ${recruiter_name}, ${candidate_name}, ${expert_name}`;
    const end = new Date(deadline);
    // Generate 3 proposed slots: deadline minus duration, minus 1 hour, minus 2 hours
    const slots = [
      new Date(end.getTime() - duration * 60000),
      new Date(end.getTime() - duration * 60000 - 60 * 60000),
      new Date(end.getTime() - duration * 60000 - 2 * 60 * 60000)
    ];
    await addProposedSlots(call.id, slots.map(s => s.toISOString()));

    attendees = [
      { email: recruiter_email },
      { email: candidate_email },
      { email: expert_email }
    ];

    // Fetch the slots for this call
    const { getSlotsForCall } = require('../models/slots');
    const slotsList = await getSlotsForCall(call.id);

    // 3. Send availability poll email to each participant
    const baseUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:4000';
    for (const attendee of attendees) {
      const slotLinks = slotsList.map(slot =>
        `<li><a href="${baseUrl}/select-availability?call_id=${call.id}&slot_id=${slot.id}&participant_email=${encodeURIComponent(attendee.email)}">${new Date(slot.slot).toLocaleString()}</a></li>`
      ).join('');
      const pollHtml = `<p>Please select your availability for the following proposed times:</p><ul>${slotLinks}</ul>`;
      const pollText = `Please select your availability for the following proposed times:\n` +
        slotsList.map(slot => `${new Date(slot.slot).toLocaleString()}: ${baseUrl}/select-availability?call_id=${call.id}&slot_id=${slot.id}&participant_email=${encodeURIComponent(attendee.email)}`).join('\n');
      await sendMail({
        to: attendee.email,
        subject: `Choose Your Availability for ${summary}`,
        text: pollText,
        html: pollHtml
      });
      await logAction(call.id, 'Availability poll sent', 'success', `Poll email sent to ${attendee.email}`);
    }

    // 6. Respond with all details
    await logAction(call.id, 'Call poll sent', 'success', 'Availability poll sent to all participants. Waiting for responses.');
    res.status(201).json({ message: 'Call poll sent. Waiting for participant responses.', call });
  } catch (err) {
    if (call && call.id) {
      await logAction(call.id, 'Call scheduling failed', 'error', err.stack || err.message);
    }
    console.error('Call scheduling error:', err);
    res.status(500).json({ error: 'Failed to schedule call', details: err.stack || err.message });
  }
});

// GET /api/calls - List all calls
router.get('/', async (req, res) => {
  try {
    const calls = await getAllCalls();
    res.json({ calls });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch calls', details: err.message });
  }
});

module.exports = router;

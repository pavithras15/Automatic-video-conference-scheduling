const express = require('express');
const router = express.Router();
const { getSlotsForCall, addSlotResponse, getResponsesForSlot } = require('../models/slots');
const { getAllCalls } = require('../models/callActions');
const { logAction } = require('../models/callLogs');
const { createCalendarEvent, oAuth2Client } = require('../services/google');
const { sendMail } = require('../services/email');

// GET /api/slots/:callId - Get slots for a call
router.get('/:callId', async (req, res) => {
  try {
    const slots = await getSlotsForCall(req.params.callId);
    res.json({ slots });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch slots', details: err.message });
  }
});

// POST /api/slots/respond - Record participant response
router.post('/respond', async (req, res) => {
  try {
    const { slot_id, participant_email, available } = req.body;
    await addSlotResponse(slot_id, participant_email, available);

    // Get all slots for this call
    const slotInfo = await (async () => {
      const result = await require('../models/db').query('SELECT * FROM call_slots WHERE id = $1', [slot_id]);
      return result.rows[0];
    })();
    if (!slotInfo) return res.json({ message: 'Response recorded' });
    const callId = slotInfo.call_id;
    // Log every response for traceability (after callId is set)
    const responseStatus = available ? 'available' : 'unavailable';
    await logAction(callId, 'Slot response', 'info', `${participant_email} responded '${responseStatus}' for slot ${slot_id}`);

    const call = (await getAllCalls()).find(c => c.id === callId);
    if (!call) return res.json({ message: 'Response recorded' });
    const participants = [call.recruiter_email, call.candidate_email, call.expert_email];

    // Get all slots and responses for this call
    const { getSlotsForCall, getResponsesForSlot } = require('../models/slots');
    const slots = await getSlotsForCall(callId);
    const slotsWithResponses = await Promise.all(
      slots.map(async slot => {
        const responses = await getResponsesForSlot(slot.id);
        return { slot, responses };
      })
    );

    // Only confirm if all participants respond 'available' to the same slot
    // Find a slot where all participants responded 'available'
    let confirmedSlot = null;
    for (const swr of slotsWithResponses) {
      const availableEmails = swr.responses.filter(r => r.available).map(r => r.participant_email);
      if (participants.every(email => availableEmails.includes(email))) {
        confirmedSlot = swr.slot;
        break;
      }
    }

    if (confirmedSlot && call) {
      // Prevent duplicate scheduling: check if event already created for this call
      const pool = require('../models/db');
      const eventAlreadyScheduled = async () => {
        const result = await pool.query('SELECT * FROM call_logs WHERE call_id = $1 AND action = $2', [call.id, 'Calendar event created']);
        return result.rows.length > 0;
      };
      // Double-check for duplicate scheduling right before sending emails
      if (await eventAlreadyScheduled()) {
        await logAction(call.id, 'Duplicate scheduling prevented', 'info', 'Attempted to send confirmation emails again, but event already scheduled.');
        return res.json({ message: 'Event already scheduled. No duplicate emails sent.' });
      }
      const summary = `${call.call_type.charAt(0).toUpperCase() + call.call_type.slice(1)} Interview`;
      const description = `Automated scheduling for ${call.call_type} interview. Participants: ${call.recruiter_name}, ${call.candidate_name}, ${call.expert_name}`;
      const start = new Date(confirmedSlot.slot);
      const end = new Date(start.getTime() + call.duration * 60000);
      const attendees = participants.map(email => ({ email }));
      const access_token = process.env.GOOGLE_ACCESS_TOKEN;
      const refresh_token = process.env.GOOGLE_REFRESH_TOKEN;
      oAuth2Client.setCredentials({ access_token, refresh_token });
      let event;
      try {
        event = await createCalendarEvent({
          summary,
          description,
          start: start.toISOString(),
          end: end.toISOString(),
          attendees
        });
        await logAction(call.id, 'Calendar event created', 'success', `Event scheduled for ${start.toISOString()}`);
        await logAction(call.id, 'About to send confirmation emails', 'info', `Sending confirmation emails to: ${participants.join(', ')}`);
        for (const email of participants) {
          await sendMail({
            to: email,
            subject: `Interview Scheduled: ${summary}`,
            text: `Your interview is scheduled for ${start.toLocaleString()}\nGoogle Meet: ${event.hangoutLink}\nAgenda: ${description}`,
            html: `<p>Your interview is scheduled for <b>${start.toLocaleString()}</b>.</p><p><b>Google Meet:</b> <a href="${event.hangoutLink}">${event.hangoutLink}</a></p><p><b>Agenda:</b> ${description}</p>`
          });
        }
        await logAction(call.id, 'Confirmation emails sent', 'success', `Confirmation emails sent to all participants.`);
      } catch (err) {
        await logAction(call.id, 'Calendar event failed', 'error', err.message);
      }
      return res.json({ message: 'All participants available for the same slot. Call scheduled and emails sent.' });
    }
    res.json({ message: 'Response recorded' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record response', details: err.message });
  }
});

module.exports = router;

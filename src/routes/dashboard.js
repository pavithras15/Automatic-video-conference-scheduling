const express = require('express');
const router = express.Router();
const { getAllCalls } = require('../models/callActions');
const { getLogsForCall } = require('../models/callLogs');
const { getSlotsForCall, getResponsesForSlot } = require('../models/slots');

// GET /api/dashboard - List all calls with logs
router.get('/', async (req, res) => {
  try {
    const calls = await getAllCalls();
    const callsWithDetails = await Promise.all(
      calls.map(async (call) => {
        const logs = await getLogsForCall(call.id);
        const slots = await getSlotsForCall(call.id);
        // For each slot, get responses
        const slotsWithResponses = await Promise.all(
          slots.map(async slot => {
            const responses = await getResponsesForSlot(slot.id);
            return { ...slot, responses };
          })
        );
        // Collect all responses for this call
        const slot_responses = slotsWithResponses.flatMap(slot =>
          slot.responses.map(r => ({
            participant_email: r.participant_email,
            available: r.available,
            slot_id: slot.id,
            slot_time: slot.slot
          }))
        );
        // Find confirmed slot (all participants available)
        const participants = [call.recruiter_email, call.candidate_email, call.expert_email];
        const confirmedSlot = slotsWithResponses.find(slot => {
          const availableEmails = slot.responses.filter(r => r.available).map(r => r.participant_email);
          return participants.every(email => availableEmails.includes(email));
        });
        return { ...call, logs, slots: slotsWithResponses, confirmedSlot, slot_responses };
      })
    );
    res.json({ calls: callsWithDetails });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard', details: err.message });
  }
});

module.exports = router;

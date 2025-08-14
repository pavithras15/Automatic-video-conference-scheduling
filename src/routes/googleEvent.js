const express = require('express');
const router = express.Router();
const { oAuth2Client, createCalendarEvent } = require('../services/google');

// POST /api/google/event - Create a calendar event with Meet link
router.post('/event', async (req, res) => {
  try {
    // For demo: tokens should be securely stored and loaded per user
    const { access_token, refresh_token } = req.body;
    oAuth2Client.setCredentials({ access_token, refresh_token });

    const { summary, description, start, end, attendees } = req.body;
    const event = await createCalendarEvent({ summary, description, start, end, attendees });
    res.json({ message: 'Event created', event });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create event', details: err.message });
  }
});

module.exports = router;

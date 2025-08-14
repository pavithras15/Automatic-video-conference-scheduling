const { google } = require('googleapis');
require('dotenv').config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Generates an authentication URL for user consent
function getAuthUrl() {
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ]
  });
}

// Set credentials after OAuth2 flow
function setCredentials(tokens) {
  oAuth2Client.setCredentials(tokens);
}

// Create a Google Calendar event with Meet link
async function createCalendarEvent({ summary, description, start, end, attendees }) {
  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
  const event = {
    summary,
    description,
    start: { dateTime: start },
    end: { dateTime: end },
    attendees,
    conferenceData: {
      createRequest: { requestId: Math.random().toString(36).substring(2) }
    }
  };
  const response = await calendar.events.insert({
    calendarId: 'primary',
    resource: event,
    conferenceDataVersion: 1
  });
  return response.data;
}

module.exports = {
  oAuth2Client,
  getAuthUrl,
  setCredentials,
  createCalendarEvent
};

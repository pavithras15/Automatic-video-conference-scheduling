const express = require('express');
const router = express.Router();
const { oAuth2Client, getAuthUrl, setCredentials } = require('../services/google');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// GET /api/google/auth/callback - Handle OAuth2 callback and exchange code for tokens
router.get('/auth/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send('Missing code parameter');
  }
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    // Save tokens to .env (for demo: print to console, you should update .env securely)
    console.log('GOOGLE_ACCESS_TOKEN=' + tokens.access_token);
    console.log('GOOGLE_REFRESH_TOKEN=' + tokens.refresh_token);
    // Optionally, write to a file for manual copy
    fs.writeFileSync(path.join(__dirname, '../../google-tokens.txt'), `GOOGLE_ACCESS_TOKEN=${tokens.access_token}\nGOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
    res.send('Authentication successful! Copy the tokens from the console or google-tokens.txt and update your .env file.');
  } catch (err) {
    console.error('Error exchanging code for tokens:', err);
    res.status(500).send('Failed to exchange code for tokens.');
  }
});

// Step 1: Redirect user to Google for consent
router.get('/auth', (req, res) => {
  const url = getAuthUrl();
  res.redirect(url);
});

// Step 2: Handle OAuth2 callback
router.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('No code provided');
  try {
    const { oAuth2Client } = require('../services/google');
    const { tokens } = await oAuth2Client.getToken(code);
    setCredentials(tokens);
    // For demo: show tokens (in production, store securely per user)
    res.json({ message: 'Google account connected!', tokens });
  } catch (err) {
    res.status(500).json({ error: 'Failed to exchange code for tokens', details: err.message });
  }
});

module.exports = router;

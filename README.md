# Backend Developer Test – Feature AI Agent Scheduler

## Objective
Automate video conference scheduling between recruiters, candidates, and Mastro Experts, with no manual intervention. The solution is designed for non-technical users and provides full traceability.

---

## Completed Features

### 1. Initial Trigger
- Simple HR form interface for recruiters to enter participants, call type, duration, and deadline.
- REST endpoint `/api/calls` to create a new call and trigger scheduling.

### 2. Gather Availability
- Agent sends personalized poll emails to all participants with proposed time slots.
- Each participant receives a unique link to select their availability.
- Slot responses are tracked and logged in the dashboard.
- Time zones are considered (slots are shown in local time).

### 3. Confirm Appointment
- Backend confirms only if all 3 participants select the same slot.
- Schedules Google Calendar event and generates a unique Meet link via API.
- Sends confirmation emails with:
  - Scheduled date/time
  - Google Meet link
  - Agenda
- Event is logged and visible in the dashboard.

### 4. Dashboard & Traceability
- Dashboard shows:
  - Requested date
  - Emails sent
  - Slot responses
  - Confirmed slot
  - Logs (actions, errors)
- All actions are logged for audit and debugging.

### 5. Exception Management
- Duplicate scheduling and email sending are prevented.
- All errors (e.g., failed emails, calendar issues) are logged and shown in the dashboard.

### 6. Demo Calls
- System tested with 3 real calls, each with 3 participants.
- No manual intervention required after initial HR form submission.

---

## Setup Instructions

1. **Clone the repository**
2. **Install dependencies**
	```sh
	npm install
	```
3. **Configure environment variables**
	- Edit `.env` with your PostgreSQL, Gmail, and Google OAuth credentials.
	- Add your Google OAuth client ID, secret, and redirect URI.
	- Add your email and app password.
4. **Set up the database**
	```sh
	node setup-db.js
	```
5. **Start the backend server**
	```sh
	npm start
	```
6. **Authenticate with Google**
	- Visit `http://localhost:3000/api/google/auth` to complete OAuth and get tokens.
	- Copy tokens from `google-tokens.txt` to `.env`.
	- Restart the backend.
7. **Access the dashboard and forms**
	- HR form: `dashboard-frontend/hr-form.html`
	- Dashboard: `dashboard-frontend/index.html`
	- Participant slot selection: `dashboard-frontend/select-availability.html`

---

## Improvements & Next Steps

### Not Yet Implemented (but possible with more time/clarification):
- **Calendar Availability Check:** Read Google/Outlook calendars for all participants and only propose truly available slots.
- **Automated Reminders:** Send reminder emails if no response within 8 hours.
- **AI-generated Agenda:** Use AI to generate a custom agenda for each call.
- **Last-Minute Change Handling:** If a participant changes availability, automatically recalculate and reschedule.
- **Multi-timezone UI:** More advanced timezone handling and display.
- **User Management:** Secure login and role-based access for HR and participants.
- **Full Outlook Integration:** Add support for Outlook calendar APIs.
- **No-code/Low-code UI:** Drag-and-drop or visual workflow builder for non-tech users.
- **Production Deployment:** Dockerization, cloud hosting, and scaling.

---

## Notes & Clarifications Needed
- Calendar read access for all participants requires OAuth consent from each user.
- Automated reminders and last-minute change logic need more workflow details.
- AI agenda generation requires integration with an AI API (e.g., OpenAI).
- Outlook integration needs Microsoft API credentials and setup.

---

## Contact & Support
For questions or demo access, contact: pavithra.puppy15@gmail.com

---

## Screenshots & Demo
- See attached images for dashboard and workflow examples.
- Demo available on request.

---

## Status
- All core requirements completed and tested.
- Ready for review and further improvements as needed.
# AI Agent Scheduler Backend

This project is a Node.js (Express) backend for automating video call scheduling between recruiters, candidates, and experts. It integrates with Google Calendar API, sends emails, generates Google Meet links, and provides a REST API for triggering and tracking scheduling requests. PostgreSQL is used for logging and traceability.

## Features
- REST API to trigger scheduling
- Google Calendar & Meet integration
- Email notifications and reminders
- Dashboard/log endpoints
- PostgreSQL for persistent storage

## Getting Started
1. Install dependencies: `npm install`
2. Set up environment variables (see `.env.example`)
3. Start the server: `npm start`

## Folder Structure
- `/src` - Main backend code
- `/src/routes` - API endpoints
- `/src/services` - Integrations (Google, email)
- `/src/models` - Database models
- `/src/utils` - Helpers

## Requirements
- Node.js >= 18
- PostgreSQL

## Environment Variables
- See `.env.example` for required variables (Google API, email, DB, etc.)

## License
MIT

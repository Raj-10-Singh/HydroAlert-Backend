# HydroAlert Backend

This is the backend for HydroAlert, a project I'm building to send real-time flood alerts to people based on where they are. Started this as a way to actually use Socket.io properly instead of just reading about it.

Still a work in progress, few things listed below aren't fully done yet.

## Stack
Node.js, Express, MongoDB (Mongoose), Socket.io, JWT for auth

## What it does
- Users register/login, get a JWT token
- Once logged in, user's live location gets saved and they're grouped into a "zone" (basically a rough area like north kolkata)
- When an alert is created for a zone, everyone watching that zone gets notified instantly through sockets, no need to refresh or poll the server
- There's also a cron job that checks weather data every 10 mins and updates flood risk automatically
- Shelters and their capacity/contact info are stored too, with geo queries so the app can show nearby ones

## Routes

Auth
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
PUT /api/auth/update-location

Alerts
POST /api/alerts
GET /api/alerts
GET /api/alerts/nearby
GET /api/alerts/zone/:zoneId
PUT /api/alerts/:id/deactivate

Zones
POST /api/zones
GET /api/zones
GET /api/zones/:zoneId
PUT /api/zones/:zoneId/update-risk

Shelters
POST /api/shelters
GET /api/shelters
GET /api/shelters/nearby
PUT /api/shelters/:id/occupancy

All routes except register/login need a Bearer token in the header.

## Running locally
npm install
Copy `.env.example` to `.env` and fill in your own values (mongo uri, jwt secret, weather api key etc)
npm run dev
## Testing
Used Postman for testing all routes, collection is in the `postman/` folder if you want to import it.

## Deployed
Live on Render: https://hydroalert-backend.onrender.com
(might take 20-30 sec to respond on first request since free tier spins down when idle)

## Other repos for this project
- AI model (Python/Flask): https://github.com/Raj-10-Singh/HydroAlert-AI
- Mobile app (React Native): https://github.com/Raj-10-Singh/HydroAlert-Frontend

## Known gaps
- Google Maps API integration on frontend is basic right now, just showing markers
- Offline support isn't built yet
- Emergency contacts screen still needs to be added, currently only shelters with call button

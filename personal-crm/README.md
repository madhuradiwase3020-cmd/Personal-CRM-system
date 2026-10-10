# Kindred — Personal CRM

A private, relationship-first CRM built with React, Vite, Express, and MongoDB. Contacts, companies, interactions, tasks, and notes are scoped to the authenticated account.

## Requirements

- Node.js 18 or newer
- MongoDB running locally or a MongoDB connection URI

## Run locally

1. Configure the API:

   ```powershell
   cd server
   Copy-Item .env.example .env
   ```

   Update `MONGODB_URI` and replace `JWT_SECRET` in `server/.env` with a long random secret.

2. Install and start the API:

   ```powershell
   npm install
   npm run dev
   ```

3. In another terminal, install and start the web app:

   ```powershell
   cd client
   npm install
   npm run dev
   ```

4. Open <http://localhost:5173>, register an account, and start adding your people.

The API listens on `http://localhost:5000` by default. Set `CLIENT_ORIGIN` to the browser origin when running the client elsewhere. To use another API URL, set `VITE_API_URL` in the Vite environment (for example, `http://localhost:5000/api`).

## API overview

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create a user account |
| POST | `/api/auth/login` | Sign in and receive a JWT |
| GET | `/api/auth/me` | Read the authenticated profile |
| PATCH | `/api/auth/profile` | Update profile or password |
| GET | `/api/dashboard` | Account-scoped dashboard summary |
| GET | `/api/reports` | Account-scoped relationship analytics |
| GET/POST | `/api/contacts` | List or create contacts |
| GET/PATCH/DELETE | `/api/contacts/:id` | Read, update, or delete a contact |
| GET/POST/PATCH/DELETE | `/api/{companies,interactions,tasks,notes}` | CRUD for the other record types |

All record and analytics endpoints require `Authorization: Bearer <token>`. Each query and mutation is constrained to the authenticated account. The UI includes account registration and login, dashboard, contact details, CRUD screens, follow-up calendar, reports, and profile/password settings.

## Build

```powershell
cd client
npm run build
```

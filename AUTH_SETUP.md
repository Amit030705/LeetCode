# Production Auth Setup

This project supports:
- Email/password register and login
- Real Google account sign-in with Google Identity Services
- JWT auth stored in an httpOnly cookie
- Gmail notifications for register, login, and Google sign-in
- Forgot-password email flow with expiring reset tokens

## Google OAuth Setup

1. Open Google Cloud Console.
2. Create or select a project.
3. Configure the OAuth consent screen.
4. Create an OAuth Client ID:
   - Application type: Web application
   - Authorized JavaScript origins:
     - `http://localhost:5173`
     - `http://127.0.0.1:5173`
   - Authorized redirect URIs are not required for the current Google Identity button flow.
5. Copy the Web Client ID.

Add the same client ID in both env files:

Backend `backend/.env`:

```env
GOOGLE_CLIENT_ID=your-google-oauth-web-client-id.apps.googleusercontent.com
FRONTEND_URL=http://localhost:5173
```

Frontend `frontend/.env`:

```env
VITE_GOOGLE_CLIENT_ID=your-google-oauth-web-client-id.apps.googleusercontent.com
```

## Gmail SMTP Setup

Use a Google App Password, not your normal Gmail password.

1. Open your Google Account.
2. Enable 2-Step Verification.
3. Create an App Password for Mail.
4. Put the generated password in `backend/.env`.

```env
GMAIL_USER=yourgmail@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
LOGIN_ALERT_TO=yourgmail@gmail.com
```

## Backend Routes

```txt
POST /user/register
POST /user/login
POST /user/google
POST /user/forgot-password
POST /user/reset-password/:token
POST /user/logout
GET  /user/check
```

## Folder Structure

```txt
backend/src/controllers/userAuthent.js      Auth controllers
backend/src/models/user.js                  User schema with Google/reset fields
backend/src/routes/userAuth.js              Auth routes
backend/src/utils/loginMailer.js            Gmail notifications and reset emails
frontend/src/pages/Login.jsx                Login + Google sign-in
frontend/src/pages/Signup.jsx               Register + Google sign-up
frontend/src/pages/ForgotPassword.jsx       Reset link request
frontend/src/pages/ResetPassword.jsx        New password form
frontend/src/authSlice.js                   Auth API thunks/state
```

## Run Locally

Backend:

```bash
cd backend
npm install
npm start
```

If your backend does not have a start script yet, run:

```bash
node src/index.js
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open:

```txt
http://localhost:5173/login
```

## Security Notes

- JWT is stored in an httpOnly cookie.
- Passwords are hashed with bcrypt.
- Reset tokens are random, hashed in MongoDB, and expire after 15 minutes.
- Google ID tokens are verified on the backend using `GOOGLE_CLIENT_ID`.
- Secrets stay in `.env`, which is ignored by git.

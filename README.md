# Trailer Assembly Portal

A web application for documenting trailer assembly with photo evidence and GPS verification, featuring an Admin Portal for session management.

## Features

### Driver Portal
- **QR Scan**: Simulation of QR code scanning for chassis ID.
- **Session Entry**: Secure driver login with PIN (6-digit auto-submit).
- **Photo Capture**:
  - Camera integration (with fallbacks).
  - Geolocation verification (Green/Red/Yellow status).
  - Photo grid management.
- **Offline Capable**: Uses local storage for data persistence.

### Admin Portal
- **Login**: Secure access (ID: `admin`, PIN: `123456`).
- **Dashboard**: View all submitted sessions.
- **Filter**: Search by Chassis ID or Driver Name.
- **Details**: View full photo evidence and session metadata.

## Setup & Run

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start Development Server**:
    ```bash
    npm run dev
    ```

3.  **Open in Browser**:
    Navigate to `http://localhost:5173` (or the URL provided in the terminal).

## Key Workflows to Test

1.  **Driver Flow**:
    - Click "Scan QR" (wait 1.5s).
    - Enter Driver Name & PIN (any 6 digits).
    - Allow or Deny Location access to see badge change.
    - Add photos, submit.
2.  **Admin Flow**:
    - Go to `/admin`.
    - Login with `admin` / `123456`.
    - View the session you just submitted.

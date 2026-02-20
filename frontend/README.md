# Logistics Admin Console

Standalone administrative terminal for the Logistics Suite.

## Deployment Information
This portal is designed to be deployed independently from the main User Portal.

### Build and Deploy
To prepare the production build:
1. Navigate to the `admin-portal` directory.
2. Run `npm run build`.
3. Deploy the resulting `dist/` folder to your chosen host (e.g., Vercel, Netlify, or Static Hosting).

## Local Development
Run `npm install` and then `npm run dev`.
By default, this console runs on **port 5174** to avoid conflicts with the User Portal (port 5173).

## Identity
- **Name:** logistics-admin-console
- **Document Title:** Logistics | Admin Console

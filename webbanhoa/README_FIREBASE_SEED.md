Seeding Firebase (Auth + Firestore)

This repository includes a seed script to create an admin auth user and populate Firestore collections with sample data.

Files added:
- `scripts/seed-data.json` — sample products, users, orders to write to Firestore.
- `scripts/seed-firebase.js` — Node script that uses the Firebase Admin SDK to create/update an admin auth user, set custom claims, and seed Firestore.

Security warnings
- DO NOT commit service account JSON or admin passwords to source control.
- The script requires a service account with appropriate permissions (Firestore Admin, Auth Admin).

How to run (PowerShell example)
1) Install dependency (one-time):

```powershell
npm install firebase-admin
```

2) Export credentials and admin credentials as environment variables:

```powershell
$env:FIREBASE_SERVICE_ACCOUNT_PATH = 'C:\path\to\serviceAccount.json'
$env:SEED_ADMIN_EMAIL = 'trandaidung9a1@gmail.com'
$env:SEED_ADMIN_PASSWORD = 'Dai1212333'
node scripts/seed-firebase.js
```

Alternative: use `GOOGLE_APPLICATION_CREDENTIALS` pointing to service account JSON (standard GCP env var).

What the script does
- Initializes `firebase-admin` using the provided service account.
- Creates or updates an auth user for the admin email and sets its password (from env).
- Sets a custom claim `{ role: 'admin' }` on the admin user.
- Writes documents to Firestore collections: `products`, `users`, `orders` from `scripts/seed-data.json`.

Post-run recommendations
- Immediately log into the admin account and change the password to something secure.
- Remove environment variables from the shell session if needed.
- Restrict service account permissions and rotate keys if the key is checked into an unsafe place.

If you'd like, I can:
- Convert the script to TypeScript and integrate it into npm scripts.
- Add additional fields, images upload to Storage, or seed more collections.
- Create a lightweight admin UI to manage seeded data.

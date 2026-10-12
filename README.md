# Elhoda Admin Dashboard

Independent Next.js application for the Elhoda administration UI. It uses the
existing shared API; it does not connect directly to MongoDB or Cloudinary.

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_BASE_API_URL` to the shared API origin (without `/api`).
3. Set the six `NEXT_PUBLIC_FIREBASE_*` values from the Firebase web app
   configuration. These are browser client settings, not service-account
   credentials.
4. Install dependencies with `npm install`, then use `npm run dev`.

Configure `dashboard.elhoda.com` as an authorized Firebase Authentication
domain and add its exact HTTPS origin to the API's `FRONTEND_URL` allowlist.
The API must continue validating Firebase tokens and admin roles on every
protected operation. Never put Firebase Admin credentials, MongoDB credentials,
Cloudinary secrets, or API signing secrets in this project.

The `/admin/contacts` page is currently a UI-only stub; it is not yet connected
to the API's protected contact-management endpoints.

`npm audit` currently reports a high-severity `braces` advisory in the
development-only lint dependency chain (`eslint-config-next` ->
`@next/eslint-plugin-next` -> `fast-glob` -> `micromatch` -> `braces`). The
installed `braces@3.0.3` is the newest version available from the configured
registry and remains within the advisory's affected range. The audit tool's
suggested automatic fix downgrades `eslint-config-next` to 14.x, which is
incompatible with this Next.js 16 app; do not apply that forced downgrade.
Production dependencies currently pass `npm audit --omit=dev`.

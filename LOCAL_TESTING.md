# GoPickup local testing

No hosting subscription is required. This setup uses an isolated MongoDB database on your Mac and never uses the production database configuration.

## Start

1. In the project directory: `npm ci`
2. In `backend`: `npm ci`, then `npm run local`
3. In another terminal at the project root: `npm run ios:local`

The API listens on `http://127.0.0.1:5050/api`. The development app defaults to this address. MongoDB data persists in ignored `backend/.local-data/`. First startup downloads a MongoDB binary; allow up to one minute for startup. The local JWT signing key changes on restart, so sign in again after restarting the backend.

Local accounts (created only by `npm run local`):

- Customer: `user@gopickup.test`
- Admin: `admin@gopickup.test`
- Password for both: `LocalDemo123!`

Never use these accounts or the local runner in production. Local API binds to loopback only. A physical iPhone needs a separate network configuration.

## Verify

- `npm run typecheck`
- `npm test --prefix backend`
- With the local backend running: `node backend/scripts/smoke.js`

Smoke checks create local test records and cover role escalation, order ownership, trusted catalog prices, booking, tracking, quotes, delivery updates, chat, reviews, and banning.

Manual simulator journey:

1. Log in as customer. Add materials or open **Post a load**. Enter addresses, contact phone, and vehicle/goods details for a load. Submit.
2. Open **Orders** and copy the tracking number. Confirm the same number works in **Track My Delivery**, with or without `#`.
3. Log out, log in as admin. Enter a quote total including delivery and send it.
4. Log in as customer, refresh Orders, and accept the quote.
5. Admin: mark In Transit, then Delivered. Customer: refresh Orders or Delivery updates and submit a review through tracking.
6. Profile: edit name/phone. Login: test password recovery; local mode displays the code rather than emailing it. Account deletion is refused while orders remain active.

## Implemented in this pass

Real booking data, server-priced material totals, tracking lookup and ownership checks, protected admin provisioning, immediate ban enforcement, editable quotes, quote acceptance, status history, customer orders, delivery updates, support-account discovery, persistent removable cart, material search, profile editing, account deletion, and local password recovery. Password reset revokes prior tokens. Unconfigured native Google authentication is hidden.

## Still requires further implementation/configuration

- Payment gateway, webhooks, refunds, and receipts. A quote acceptance is **not** payment; orders remain Unpaid.
- Driver/vendor onboarding, verification, inventory management, driver assignment, and driver work screens.
- Real GPS coordinates, maps, background driver location and push notifications. Delivery updates currently show server status events, refreshed on focus or pull-to-refresh.
- Production password reset email delivery and native Google credentials.
- Full manual device-flow testing and production operations (deployment, backups, monitoring).

Catalog values remain pilot values in `backend/catalog.js` and the frontend catalog; verify them before use. Customer Orders replaces the previous sample Map timeline. No live payment or live tracking is implied.

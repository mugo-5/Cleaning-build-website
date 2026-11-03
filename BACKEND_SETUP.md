# Quote request backend

This repository is currently a static website. The quote API is implemented as a Cloudflare Pages Function backed by Cloudflare D1. GitHub Pages cannot execute this backend, so publish the site through Cloudflare Pages to use `/api/quotes`.

## Deploy on Cloudflare Pages

1. Create a D1 database named `kims-sparkle-quotes` in the Cloudflare dashboard.
2. Copy its database ID into `wrangler.toml`, replacing `REPLACE_WITH_D1_DATABASE_ID`.
3. Apply the schema from the repository root:

   ```sh
   npx wrangler d1 migrations apply kims-sparkle-quotes --remote
   ```

   If this is the first migration and Wrangler does not find it automatically, use:

   ```sh
   npx wrangler d1 execute kims-sparkle-quotes --remote --file=migrations/0001_create_quote_requests.sql
   ```

4. In Cloudflare Pages, create a project connected to this GitHub repository. Set the production branch to `main` and the build output directory to `.` (no build command is needed). Cloudflare Pages will detect `functions/api/quotes.js` and provide `POST /api/quotes`.
5. Deploy the project. Test the endpoint with a valid JSON POST before wiring it to the form.

The API validates request fields and inserts quote submissions into D1. It does not expose a route for reading submissions publicly. Review customer-data access, backups, and retention in Cloudflare before using it for real inquiries.

## Front-end integration

The existing quote form currently opens a prefilled WhatsApp message in the visitor's browser. To also save submissions in D1, add a same-origin `POST /api/quotes` request to the form submit handler before opening the WhatsApp link. Send JSON with these fields:

```json
{
  "name": "Customer name",
  "phone": "0722 403 033",
  "service": "Sofa Deep Cleaning",
  "details": "Project details"
}
```

Only open WhatsApp after the API returns success, and keep the WhatsApp handoff as a user-initiated link; a website backend cannot silently send a WhatsApp message. The API endpoint is not connected to the existing form yet.

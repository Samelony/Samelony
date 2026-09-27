# Samelony — custom furniture, made to order

A Next.js app for a custom-furniture dropshipping business: customers describe
(and optionally sketch) the furniture they want, get an AI-assisted design
brief, receive a quote, approve it and pay a deposit, and get progress updates
while their piece is manufactured — with the long-term intent of routing
production through vetted manufacturing partners in Vietnam.

## What's built

**Customer side**
- `/` — landing page explaining the flow.
- `/design` — submission form: furniture type, dimensions, materials, budget,
  free-text description, and file uploads (sketches, photos, inspiration
  images, PDFs). Includes an optional "Preview AI brief" button.
- `/orders/[id]` — order status page: status stepper (New → Reviewing →
  Quoted → Approved → Manufacturing → Completed), the submitted spec and
  files, the AI brief, the quote once one exists, buttons to approve/request
  changes, a "Pay deposit" button, and a feed of production updates with
  photos.
- `/track` — simple lookup by order ID/link.

**Admin side** (password-protected)
- `/admin` — table of all design requests.
- `/admin/orders/[id]` — full request detail, status controls, a quote
  builder (manufacturing/materials/labor/delivery/margin/deposit/production
  time), and a form to post production updates with photos.

**AI assist**
- `src/lib/ai.ts` calls the Anthropic API to turn a customer's free-text
  description into a structured design brief (category, materials,
  dimensions, style, complexity, clarifying questions). Used both for the
  live "Preview AI brief" button and automatically on submission. Gracefully
  no-ops if `ANTHROPIC_API_KEY` isn't set.

**Payments**
- The deposit flow is Stripe-ready (`src/app/api/orders/[id]/deposit`,
  `src/app/api/stripe/webhook`): with `STRIPE_SECRET_KEY` set it creates a
  real Stripe Checkout session; the webhook confirms payment and marks the
  deposit paid. Without a Stripe key it falls back to a **demo mode** that
  marks the deposit paid immediately, so you can exercise the whole flow
  without a payment processor configured.

**Email notifications**
- `src/lib/email.ts` emails you (via [Resend](https://resend.com)) the full
  spec — customer info, dimensions, materials, description, AI summary, link
  to the admin page — the moment someone submits a design. Set it up:
  1. Create your business email (any provider — Gmail, Google Workspace,
     etc.) if you haven't yet.
  2. Sign up at [resend.com](https://resend.com) (free tier covers this) and
     create an API key.
  3. Set `RESEND_API_KEY` to that key and `NOTIFY_EMAIL` to your business
     email address.
  Without these two set, submissions still work — you just won't get an
  email and will need to check `/admin` instead.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in at least ADMIN_PASSWORD
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Visit `/admin/login` to
sign into the dashboard.

### Environment variables

See `.env.example`. Only `ADMIN_PASSWORD` is required to use the admin
dashboard; `ANTHROPIC_API_KEY`, the `STRIPE_*` vars, and the email vars
(`RESEND_API_KEY`, `NOTIFY_EMAIL`, `EMAIL_FROM`) are all optional and the
app degrades gracefully without them.

## Known limitations (by design, for an MVP)

- **Storage**: orders and quotes are persisted to a JSON file at
  `.data/orders.json`, and uploaded files are saved under
  `public/uploads/<orderId>/`. This is simple and fine for local dev or a
  single always-on server, but it will **not** work on stateless/serverless
  deployments (e.g. Vercel) where the filesystem isn't persistent or shared
  across instances. Before going to production, swap `src/lib/orders.ts` for
  a real database (Postgres/Supabase/etc.) and `src/lib/uploads.ts` for
  object storage (S3, Cloudinary, etc.).
- **Order links are the auth**: customers reach their order via an
  unguessable UUID in the URL rather than a login. Fine for an MVP demo, but
  consider emailing magic links or adding real customer accounts later.
- **Admin auth** is a single shared password (`ADMIN_PASSWORD`), not
  per-user accounts. Fine for one or two operators; add real auth
  (e.g. NextAuth) before adding more staff.
- **Customer-facing status emails**: you now get emailed on new submissions
  (see above), but customers still have to revisit their order link to see
  status changes — no "your quote is ready" email to them yet.

## Roadmap toward the dropshipping / Vietnam-manufacturing model

- A manufacturer directory (multiple Vietnam partners, their specialties,
  lead times, MOQs) and a way to route/send an approved spec + AI brief to a
  specific manufacturer as an RFQ.
- Splitting one customer order across manufacturers/SKUs if it combines
  multiple pieces.
- Logistics: freight/customs handling from the manufacturer to the customer,
  and surfacing shipping status in the order-tracking page.
- Real image generation (not just a text brief) so customers can see a
  visual concept before quoting.
- Customer-facing email/SMS notifications on status changes (quote ready,
  approved, shipped) — right now only you get emailed, on submission.
- Multi-operator admin accounts and roles (sales/ops vs. manufacturing
  liaison).

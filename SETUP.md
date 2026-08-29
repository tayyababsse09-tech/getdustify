# GetDustify — Review System Fix: Setup Guide

## What was wrong
`getdustify.html` was already written to call `/api/reviews`, but that API
never existed in the repo. Every submitted review vanished — the "Thank you"
message showed regardless of what actually happened.

## What's included here
- `api/reviews.js` — public endpoint (submit new review as "pending", fetch approved ones)
- `api/admin/reviews.js` — protected endpoint (list pending, approve/reject)
- `admin.html` — password-protected page to approve/reject reviews
- `package.json` — adds the `@vercel/kv` dependency these files need

## Steps

### 1. Add these files to your repo
Copy `package.json`, the `api/` folder, and `admin.html` into your
`getdustify` repo (same folder as `getdustify.html`), keeping the folder
structure. Commit and push to GitHub — Vercel will redeploy automatically.

### 2. Create a free Vercel KV database
1. Open your project on vercel.com → **Storage** tab
2. Click **Create Database** → choose **KV**
3. Name it (e.g. `getdustify-reviews`) → Create
4. On the "Connect to Project" step, select your `getdustify` project
   → this automatically adds the required environment variables
     (`KV_REST_API_URL`, `KV_REST_API_TOKEN`, etc.) for you.

### 3. Set an admin password
In Vercel → your project → **Settings → Environment Variables**, add:
- Name: `ADMIN_PASSWORD`
- Value: any password you'll remember (e.g. something only you know)

Redeploy the project after adding it (Vercel → Deployments → ⋯ → Redeploy).

### 4. Use it
- Reviews submitted on the site now go to a "pending" list, invisible to visitors.
- Go to `https://<your-site>/admin.html`, enter your `ADMIN_PASSWORD`.
- Approve or Reject each review. Approved ones appear on the live site immediately.

### Note
`admin.html` isn't linked from anywhere on the public site, but it isn't
truly private — anyone who guesses the URL sees a password prompt. For a
small business site this is a reasonable level of protection; just don't
share the URL/password publicly.

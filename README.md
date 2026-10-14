# UCFCA Official Website

The public website for Ultimate Clique of Friends Club Abuja (UCFCA), built around Love, Integrity and Service.

## Stack

React, Vite, React Router, Lucide icons and custom responsive CSS.

## Run locally

Use Node 20+ and pnpm or npm:

```bash
pnpm install
pnpm dev           # local dev server
pnpm build         # production build in dist/
pnpm lint          # ESLint
pnpm format        # Prettier
```

Copy `.env.example` to `.env` and fill in `VITE_WEB3FORMS_KEY` to make the forms send email (see below).
Without it the site still runs; forms show a message asking people to email the club instead.

## Forms (Web3Forms)

The membership, payment-confirmation and contact forms post to [Web3Forms](https://web3forms.com),
which emails each submission to the club inbox.

1. Go to web3forms.com, enter `ultimatefriendsabj@gmail.com` and confirm the email it sends.
2. Copy the access key into `.env` locally, and into Netlify under
   **Site configuration → Environment variables** as `VITE_WEB3FORMS_KEY`.
3. Redeploy. The key is public by design (it can only send to that inbox).

## Deploying (Netlify)

`netlify.toml` holds the build settings and the redirect that lets React Router handle every URL.
Connect the GitHub repo in Netlify, add the environment variable above, and deploy. A custom domain
can be attached under **Domain management**.

The site address (`https://ucfca.netlify.app`) is set once in `vite.config.js` and used for link
previews, `sitemap.xml` and `robots.txt`, which are generated on each build. If the address changes,
update it there or set a `SITE_URL` environment variable in Netlify.

## Updating content

Everything editable lives in `src/data/content.js`:

- **Events** — add to `events`; they sort into upcoming/past by date automatically, and the next
  upcoming one appears on the home page.
- **News** — add to `news`; newest shows first.
- **Gallery** — put photos in `public/assets/gallery/` and add an album to `gallery`.
- Officers, committees, projects, contact and bank details are in the same file.

Each list has a commented example showing the fields to fill in.

## Project structure

```
src/
  App.jsx          routes
  components/      shared UI (header, footer, carousel, cards, forms)
  pages/           one file per page
  data/content.js  site content: projects, officers, committees, contacts, bank details
  styles/          CSS, imported in order from styles/index.css
public/assets/     logo, hero photos, Constitution PDF
```

Most content updates (officers, projects, contact details) only need edits to `src/data/content.js`.

## Included

- Public routes for the approved sitemap, with data-driven officers, projects, committees and statistics
- Responsive navigation, donation account copy action, forms delivered by Web3Forms and 404 state
- Data-driven events, news and gallery pages with empty states
- Accurate supplied history, outreach projects, contacts and donation details
- Official UCFCA logo and Constitution PDF, including browser reading, download and article navigation

## Future roadmap

Add real UCFCA photography, a backend (Firebase or Supabase), authenticated admin dashboard, content management and member features.

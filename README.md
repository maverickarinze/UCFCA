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

Copy `.env.example` to `.env` before adding any future integrations. No secrets are required for the current public-site build.

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
- Responsive navigation, donation account copy action, accessible forms and 404 state
- Accurate supplied history, outreach projects, contacts and donation details
- Official UCFCA logo and Constitution PDF, including browser reading, download and article navigation
- Clear placeholder states for missing photos, event/news and gallery content

## Future roadmap

Add real UCFCA photography, a backend (Firebase or Supabase), authenticated admin dashboard, form delivery, content management and member features.

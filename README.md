# CodeVault 1.3

A lightweight Node.js + Express project showcase SPA with a mobile-first Liquid Glass interface.

## Run locally

1. Install Node.js 18 or newer.
2. Copy `.env.example` to `.env` and set a private `SESSION_SECRET`.
3. In this folder run:

```bash
npm install
npm start
```

4. Open http://localhost:3000

## Current features

- Persistent sign-in session (30-day cookie; remains signed in until sign-out or session expiry).
- Four interface languages and saved appearance preferences.
- Draggable floating Liquid Glass bottom navigation: drag the glass indicator to a destination or tap a section.
- Developer profiles, optional bio/skills and follow/unfollow.
- Project publishing with a project link, an image, or both. No source-code editor or code-file upload is shown in the project flow.
- Project images are limited to 500 KB (PNG, JPG, WEBP, GIF).
- Public project browsing and direct project links.

## Existing data

When replacing an older CodeVault version, keep your existing `.env` and `data.json`. The new version reads the existing users and repositories. Old source files are no longer displayed in the project showcase; the new publishing flow is link/image based.

## Production notes

Use HTTPS, a strong unique `SESSION_SECRET`, persistent storage for `data.json` and `sessions/`, and regular backups. The JSON database is intended for a small demo; use a real database before public high-traffic deployment.

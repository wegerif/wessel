# wesselwegerif.nl (custom rebuild)

Custom portfolio + posts frontend built with Astro + React, with WordPress as a headless CMS.

## Stack

- Astro for the site framework
- React for interactive components
- WordPress REST API for posts and pages

## Setup

1. Install dependencies:

```sh
npm install
```

2. Optional: configure WordPress API endpoint in `.env`:

```env
WORDPRESS_API_URL=https://www.wesselwegerif.nl/wp-json/wp/v2
WORDPRESS_CACHE_TTL_MS=120000
WORDPRESS_INCLUDE_LOCAL_PORTFOLIO=true
```

`WORDPRESS_CACHE_TTL_MS` keeps WordPress responses in memory during the current dev/build process to speed up page-to-page navigation. Set `0` to disable caching.
`WORDPRESS_INCLUDE_LOCAL_PORTFOLIO` (default `true`) shows backup portfolio items locally until migration is finished. Set `false` after your WordPress posts are migrated.

3. Run local dev:

```sh
npm run dev
```

4. Build production:

```sh
npm run build
```

`npm run build` only creates static files in `dist/` (it does not run a local server).  
Use `npm run dev` for local development (`localhost:4321`) or `npm run preview` to preview a build.

## Current pages

- `/` home
- `/about` about + skill tree
- `/contact` contact
- `/posts` posts overview
- `/posts/[slug]` post detail

## Content migration status

- Home page now pulls and shows your WordPress **About** and **Contact** page copy.
- Posts feed uses native WordPress `post` content, with optional local portfolio fallback data until migration is complete.
- Theme toggle is available in the top-right (sun/moon icon).
- Custom cursor + coordinate HUD are enabled in desktop browsers.
- Sprite-stack car selector (🚘) is in the header; selected car follows mouse and climbs road blocks.

## Deploying on DirectAdmin (static hosting path)

This project builds to static files (`dist/`), so it works on normal webhosting without Node runtime.

1. In this repo root, build:

```sh
npm install
npm run build
```

2. In DirectAdmin:
   - open **File Manager**
   - go to your domain document root (usually `domains/<your-domain>/public_html/`)
   - back up existing files first
   - upload the full contents of local `dist/` into `public_html/`
3. Keep WordPress installed in a subfolder or subdomain for CMS admin, for example:
   - `cms.wesselwegerif.nl`
   - or `/wp-admin` still available on your existing install
4. Keep `WORDPRESS_API_URL` pointing to that WordPress site:

```env
WORDPRESS_API_URL=https://www.wesselwegerif.nl/wp-json/wp/v2
```

5. Every time you update the frontend:
   - run `npm run build`
   - upload updated `dist/` files again

## Auto-deploy to test.wesselwegerif.nl (GitHub Actions)

A workflow is included at `.github/workflows/deploy-test.yml`.

It runs on:
- push to `main`
- manual trigger from Actions tab (`workflow_dispatch`)

Add these GitHub repository **Secrets** first:
- `TEST_FTP_SERVER` (for example: `ftp.wesselwegerif.nl`)
- `TEST_FTP_USERNAME`
- `TEST_FTP_PASSWORD`
- `TEST_FTP_SERVER_DIR` (for example: `/domains/test.wesselwegerif.nl/public_html/`)

Then every push to `main` will:
1. install dependencies
2. run `npm run build`
3. upload `dist/` to your test subdomain

If your host requires SFTP instead of FTPS, change `protocol` and `port` in the workflow file.

## Migrating portfolio items to native WordPress posts

Recommended (no code):

1. In WordPress admin, install plugin **Post Type Switcher**
2. Go to **Portfolio** items list
3. Bulk select items
4. Bulk edit -> change post type to **Post**
5. Save
6. Check categories/tags/permalinks and featured images

After migration:

- Your content lives in native `post`
- You can remove Visual Portfolio later
- This Astro frontend reads native posts directly

## Notes

- `wesselwegerif.nl backup 2026-02-22/` is ignored in git.
- Posts are fetched from WordPress at build time.

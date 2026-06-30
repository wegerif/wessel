# wesselwegerif.nl (custom rebuild)

Custom portfolio + posts frontend built with Astro + React, with WordPress as a headless CMS.

## Stack

- Astro for the site framework
- React for interactive components
- WordPress REST API for posts, pages, and legacy portfolio items

## Setup

1. Install dependencies:

```sh
npm install
```

2. Optional: configure WordPress API endpoint in `.env`:

```env
WORDPRESS_API_URL=https://www.wesselwegerif.nl/wp-json/wp/v2
```

3. Run local dev:

```sh
npm run dev
```

4. Build production:

```sh
npm run build
```

## Current pages

- `/` home
- `/posts` posts overview
- `/posts/[slug]` post detail

Legacy routes (`/blog`, `/blog/[slug]`) redirect to `/posts`.

## Content migration status

- Home page now pulls and shows your WordPress **About** and **Contact** page copy.
- Posts feed now combines:
  - native WordPress `post`
  - legacy `portfolio` custom post type (Visual Portfolio)
- This keeps your existing portfolio work visible while you migrate to native posts.

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
- This Astro frontend will still work (it already reads native posts)

## Notes

- `wesselwegerif.nl backup 2026-02-22/` is ignored in git.
- Posts are fetched from WordPress at build time.

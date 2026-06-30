# wesselwegerif.nl (custom rebuild)

Custom portfolio + blog frontend built with Astro + React, with WordPress as a headless CMS.

## Stack

- Astro for the site framework
- React for interactive components
- WordPress REST API for posts

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
- `/blog` post overview
- `/blog/[slug]` post detail

## Notes

- `wesselwegerif.nl backup 2026-02-22/` is ignored in git.
- Posts are fetched from WordPress at build time.

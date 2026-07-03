Wessel site guide (beginner-friendly)

What this project is
- This repo is your new website frontend (Astro + React).
- WordPress is used only as the content manager (headless CMS).
- Your public website is the static files from `dist/`.
- The folder `wesselwegerif.nl backup 2026-02-22/` is old backup data, not your live frontend.

Quick daily workflow (5 steps)
1. Edit content in WordPress (or edit code in this repo).
2. In project folder, run: `npm run build`
3. Open DirectAdmin -> `public_html`
4. Upload files from local `dist/` (contents only)
5. Refresh live site and check Home + Posts + About + Contact

How your site works
1. You write/edit content in WordPress (Posts/Pages).
2. This Astro project fetches content from WordPress API (`/wp-json/wp/v2`).
3. You run `npm run build` locally.
4. Build creates static files in `dist/`.
5. You upload `dist/` files to hosting (`public_html`).
6. Visitors see the new version.

Important: content is fetched at build time.  
If you change WordPress content, rebuild + re-upload `dist/` to show updates on the live site.

------------------------------------------------------------
1) First-time setup on your computer
------------------------------------------------------------
From repo root:

```sh
npm install
```

Create `.env` (optional, but recommended):

```env
WORDPRESS_API_URL=https://www.wesselwegerif.nl/wp-json/wp/v2
WORDPRESS_CACHE_TTL_MS=120000
WORDPRESS_INCLUDE_LOCAL_PORTFOLIO=true
```

Run local dev server:

```sh
npm run dev
```

Preview production build locally:

```sh
npm run build
npm run preview
```

------------------------------------------------------------
2) Deploy to DirectAdmin (replace current site frontend)
------------------------------------------------------------
1. Build locally:

```sh
npm run build
```

2. In DirectAdmin:
   - Open **File Manager**
   - Go to domain root (usually `domains/<your-domain>/public_html/`)
   - Back up existing files first
3. Upload the contents of local `dist/` into `public_html/`  
   (upload files inside `dist`, not the `dist` folder itself)
4. Keep SSL (Let’s Encrypt) enabled
5. Confirm domain points to correct hosting account/document root

------------------------------------------------------------
3) WordPress setup for content management
------------------------------------------------------------
You still keep a running WordPress installation for editing content.

- Can be same domain (if API reachable) or subdomain like `cms.yourdomain.com`
- Required API endpoint format:
  `https://<your-cms-domain>/wp-json/wp/v2`

In this project, `src/lib/wordpress.ts` currently reads:
- `posts` (blog/project entries)
- `pages` for `about` and `contact`
- local fallback portfolio posts from `src/data/localPortfolioPosts.json` (toggle with `WORDPRESS_INCLUDE_LOCAL_PORTFOLIO`)

------------------------------------------------------------
4) Converting old portfolio items to normal Posts
------------------------------------------------------------
Do this in your live WordPress admin (not in backup files):

1. Install plugin **Post Type Switcher**
2. Go to Portfolio items list
3. Select items in bulk
4. Bulk edit -> change type to **Post**
5. Save
6. Check featured images, categories/tags, and permalinks

Why: this project now uses native WordPress posts only.

------------------------------------------------------------
5) Normal update flow (after launch)
------------------------------------------------------------
For content edits only (new post/text change):
1. Edit in WordPress admin
2. In this repo: `npm run build`
3. Upload refreshed `dist/` to `public_html/`

For code/design changes:
1. Edit code in this repo
2. Test with `npm run dev`
3. Build with `npm run build`
4. Upload new `dist/`

------------------------------------------------------------
6) How to add features yourself
------------------------------------------------------------
Add a new page:
- Create `src/pages/<name>.astro`
- Visit it at `/<name>`
- Add nav link in `src/layouts/SiteLayout.astro`

Add a reusable component:
- Create file in `src/components/`
- Import into a page/layout and use it

Change site-wide style/theme:
- Edit CSS variables in `src/layouts/SiteLayout.astro`

Change WordPress content fetching:
- Edit `src/lib/wordpress.ts`
- Add new API call(s), then render in pages/components

Add React interactivity:
- Create `.tsx` component in `src/components/`
- Use with `client:load` where needed

------------------------------------------------------------
7) Files you will use most
------------------------------------------------------------
- `src/pages/index.astro` -> homepage
- `src/pages/posts.astro` -> posts overview
- `src/pages/posts/[slug].astro` -> single post page
- `src/pages/about.astro` -> about page
- `src/pages/contact.astro` -> contact page
- `src/layouts/SiteLayout.astro` -> global layout/nav/theme
- `src/lib/wordpress.ts` -> WordPress API logic
- `package.json` -> scripts (`dev`, `build`, `preview`)

------------------------------------------------------------
8) Good "later" improvements
------------------------------------------------------------
- Automate deploy (GitHub Actions -> build + upload)
- Move WordPress to separate CMS subdomain
- Add backup routine for WordPress database + uploads
- Add redirects for changed slugs
- Add analytics/privacy-friendly metrics

------------------------------------------------------------
9) Quick troubleshooting
------------------------------------------------------------
Problem: posts not updating live  
Cause: site is static build output  
Fix: run `npm run build` again and re-upload `dist/`

Problem: build fails to fetch WordPress  
Fix checklist:
- Check `WORDPRESS_API_URL`
- Open `<url>/posts` in browser
- Ensure WordPress API is public and reachable

Problem: empty About/Contact on homepage  
Fix:
- Ensure WordPress pages have slugs exactly `about` and `contact`

------------------------------------------------------------
10) Learning resources (beginner-friendly)
------------------------------------------------------------
Core web basics:
- HTML/CSS/JS: https://developer.mozilla.org/en-US/docs/Learn
- JavaScript basics: https://javascript.info/

Astro:
- Astro docs (start here): https://docs.astro.build/
- Astro tutorial: https://docs.astro.build/en/tutorial/

React basics:
- React official learn: https://react.dev/learn

TypeScript:
- TypeScript handbook: https://www.typescriptlang.org/docs/handbook/intro.html

WordPress (headless + REST API):
- WP REST API handbook: https://developer.wordpress.org/rest-api/
- WP post endpoint reference: https://developer.wordpress.org/rest-api/reference/posts/
- WP pages endpoint reference: https://developer.wordpress.org/rest-api/reference/pages/

Git + GitHub:
- GitHub Skills (interactive): https://skills.github.com/
- Simple Git guide: https://www.atlassian.com/git/tutorials

How to learn fastest (recommended):
1. Make one tiny change in `src/pages/index.astro`
2. Run `npm run dev` and view the change
3. Commit the change
4. Build + deploy once
5. Repeat with one small feature at a time

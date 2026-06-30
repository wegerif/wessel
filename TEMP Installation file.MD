How to deploy this on your DirectAdmin host (detailed)
1) Build locally
From repo root:

This creates dist/.

2) Backup your current live files
In DirectAdmin:

Go to File Manager
Open your domain root (usually: domains/<domain>/public_html/)
Download/backup existing files first
3) Upload Astro build
Upload contents of dist/ into public_html/ (not the folder itself, the files inside it)
4) Keep WordPress as CMS backend
You can keep WordPress running for content management, but use Astro as frontend.

Ensure this endpoint stays reachable:
https://www.wesselwegerif.nl/wp-json/wp/v2
If WordPress moves to subdomain later, set:
WORDPRESS_API_URL=https://<your-cms-domain>/wp-json/wp/v2
rebuild and re-upload dist/
5) SSL + domain
Keep Let’s Encrypt enabled in DirectAdmin
Ensure domain points to correct hosting account/public_html
6) Updating site later
Every update cycle:

Then upload refreshed dist/ files again.

Converting portfolio items to native WP posts (recommended path)
Use WordPress plugin Post Type Switcher:

WP Admin → Plugins → Add New → install Post Type Switcher
Go to portfolio items list
Select items in bulk
Bulk Edit → change type to Post
Save
Check permalink + categories/tags + featured images
This gives you portable, future-proof native content.


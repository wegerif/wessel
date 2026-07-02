-- Run on target WordPress DB (adjust table prefix if not wp_)
DELETE pm FROM wp_postmeta pm JOIN wp_posts p ON p.ID = pm.post_id WHERE p.post_name = 'dat-ging-niet-helemaal-goed' AND p.post_type = 'post';
DELETE tr FROM wp_term_relationships tr JOIN wp_posts p ON p.ID = tr.object_id WHERE p.post_name = 'dat-ging-niet-helemaal-goed' AND p.post_type = 'post';
DELETE c FROM wp_comments c JOIN wp_posts p ON p.ID = c.comment_post_ID WHERE p.post_name = 'dat-ging-niet-helemaal-goed' AND p.post_type = 'post';
DELETE FROM wp_posts WHERE post_name = 'dat-ging-niet-helemaal-goed' AND post_type = 'post';

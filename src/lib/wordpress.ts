export type WordPressPost = {
	id: number;
	date: string;
	slug: string;
	link: string;
	title: { rendered: string };
	excerpt: { rendered: string };
	content: { rendered: string };
};

export type WordPressPage = {
	id: number;
	slug: string;
	title: { rendered: string };
	content: { rendered: string };
};

export type SitePost = WordPressPost;

export type SitePageContent = {
	title: string;
	text: string;
};

const apiBase = import.meta.env.WORDPRESS_API_URL ?? 'https://www.wesselwegerif.nl/wp-json/wp/v2';
const configuredCacheTtl = Number(import.meta.env.WORDPRESS_CACHE_TTL_MS ?? 120000);
const wordpressCacheTtlMs = Number.isFinite(configuredCacheTtl) && configuredCacheTtl >= 0 ? configuredCacheTtl : 120000;
const responseCache = new Map<string, { expiresAt: number; value: unknown }>();
const inFlightRequests = new Map<string, Promise<unknown>>();

async function wpFetch<T>(path: string): Promise<T> {
	const requestUrl = `${apiBase}${path}`;

	if (wordpressCacheTtlMs > 0) {
		const cached = responseCache.get(requestUrl);
		if (cached && cached.expiresAt > Date.now()) {
			return cached.value as T;
		}
	}

	const inFlight = inFlightRequests.get(requestUrl);
	if (inFlight) {
		return (await inFlight) as T;
	}

	const request = (async () => {
		const response = await fetch(requestUrl, {
			headers: { Accept: 'application/json' },
		});

		if (!response.ok) {
			throw new Error(`WordPress request failed (${response.status}) for ${path}`);
		}

		const payload = (await response.json()) as T;
		if (wordpressCacheTtlMs > 0) {
			responseCache.set(requestUrl, {
				value: payload,
				expiresAt: Date.now() + wordpressCacheTtlMs,
			});
		}
		return payload;
	})();

	inFlightRequests.set(requestUrl, request);
	try {
		return await request;
	} finally {
		inFlightRequests.delete(requestUrl);
	}
}

function decodeEntities(input: string): string {
	return input
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&#8217;/g, "'")
		.replace(/&#8211;/g, '-')
		.replace(/&#8220;/g, '"')
		.replace(/&#8221;/g, '"')
		.replace(/&#8230;/g, '...')
		.replace(/&#039;/g, "'")
		.replace(/&quot;/g, '"')
		.replace(/&rsquo;/g, "'")
		.replace(/&ldquo;/g, '"')
		.replace(/&rdquo;/g, '"')
		.replace(/&ndash;/g, '-')
		.replace(/&hellip;/g, '...');
}

export function stripHtmlAndShortcodes(input: string): string {
	return decodeEntities(input)
		.replace(/<[^>]+>/g, ' ')
		.replace(/\[[^\]]+\]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

export function getPostTitleText(post: SitePost): string {
	return stripHtmlAndShortcodes(post.title.rendered);
}

export function getPostPreviewText(post: SitePost, maxLength = 180): string {
	const excerptText = stripHtmlAndShortcodes(post.excerpt.rendered);
	const contentText = stripHtmlAndShortcodes(post.content.rendered);
	const source = excerptText || contentText;

	if (source.length <= maxLength) {
		return source;
	}

	return `${source.slice(0, maxLength).trim()}...`;
}

function sortByDateDesc<T extends { date: string }>(items: T[]): T[] {
	return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

async function getNativePosts(limit = 100): Promise<SitePost[]> {
	return wpFetch<WordPressPost[]>(`/posts?per_page=${limit}&orderby=date&order=desc&status=publish`);
}

export async function getAllPosts(): Promise<SitePost[]> {
	const posts = await getNativePosts();
	return sortByDateDesc(posts);
}

export async function getLatestPosts(limit = 6): Promise<SitePost[]> {
	const allPosts = await getAllPosts();
	return allPosts.slice(0, limit);
}

export async function getPageContentBySlug(slug: string): Promise<SitePageContent | null> {
	const pages = await wpFetch<WordPressPage[]>(`/pages?slug=${slug}&status=publish`);
	const page = pages[0];

	if (!page) {
		return null;
	}

	return {
		title: stripHtmlAndShortcodes(page.title.rendered),
		text: stripHtmlAndShortcodes(page.content.rendered),
	};
}

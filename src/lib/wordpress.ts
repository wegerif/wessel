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

export type SitePost = WordPressPost & {
	source: 'post' | 'portfolio';
};

export type SitePageContent = {
	title: string;
	text: string;
};

const apiBase = import.meta.env.WORDPRESS_API_URL ?? 'https://www.wesselwegerif.nl/wp-json/wp/v2';

async function wpFetch<T>(path: string): Promise<T> {
	const response = await fetch(`${apiBase}${path}`, {
		headers: { Accept: 'application/json' },
	});

	if (!response.ok) {
		throw new Error(`WordPress request failed (${response.status}) for ${path}`);
	}

	return (await response.json()) as T;
}

function stripHtmlAndShortcodes(input: string): string {
	return input
		.replace(/<[^>]+>/g, ' ')
		.replace(/\[[^\]]+\]/g, ' ')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&#8217;/g, "'")
		.replace(/&#8220;/g, '"')
		.replace(/&#8221;/g, '"')
		.replace(/\s+/g, ' ')
		.trim();
}

function sortByDateDesc<T extends { date: string }>(items: T[]): T[] {
	return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

async function getNativePosts(limit = 100): Promise<SitePost[]> {
	const posts = await wpFetch<WordPressPost[]>(
		`/posts?per_page=${limit}&orderby=date&order=desc&status=publish`,
	);

	return posts.map((post) => ({
		...post,
		source: 'post' as const,
	}));
}

async function getLegacyPortfolioPosts(limit = 100): Promise<SitePost[]> {
	try {
		const portfolioItems = await wpFetch<WordPressPost[]>(
			`/portfolio?per_page=${limit}&orderby=date&order=desc&status=publish`,
		);

		return portfolioItems.map((item) => ({
			...item,
			source: 'portfolio' as const,
		}));
	} catch (error) {
		if (error instanceof Error && error.message.includes('(404)')) {
			console.info('No /portfolio endpoint found; using native posts only.');
			return [];
		}

		throw error;
	}
}

export async function getAllPosts(): Promise<SitePost[]> {
	const [posts, portfolioItems] = await Promise.all([getNativePosts(), getLegacyPortfolioPosts()]);
	return sortByDateDesc([...posts, ...portfolioItems]);
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

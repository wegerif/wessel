export type WordPressPost = {
	id: number;
	date: string;
	slug: string;
	link: string;
	title: { rendered: string };
	excerpt: { rendered: string };
	content: { rendered: string };
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

export async function getLatestPosts(limit = 6): Promise<WordPressPost[]> {
	return wpFetch<WordPressPost[]>(`/posts?per_page=${limit}&orderby=date&order=desc`);
}

export async function getAllPosts(): Promise<WordPressPost[]> {
	return wpFetch<WordPressPost[]>(`/posts?per_page=100&orderby=date&order=desc`);
}

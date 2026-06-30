import { useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

function getInitialTheme(): Theme {
	if (typeof window === 'undefined') {
		return 'dark';
	}

	const saved = window.localStorage.getItem('theme-preference');
	if (saved === 'dark' || saved === 'light') {
		return saved;
	}

	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function ThemeToggle() {
	const [theme, setTheme] = useState<Theme>('dark');

	useEffect(() => {
		const nextTheme = getInitialTheme();
		document.documentElement.setAttribute('data-theme', nextTheme);
		setTheme(nextTheme);
	}, []);

	function toggleTheme() {
		const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
		document.documentElement.setAttribute('data-theme', nextTheme);
		window.localStorage.setItem('theme-preference', nextTheme);
		setTheme(nextTheme);
	}

	return (
		<button className="theme-toggle" type="button" onClick={toggleTheme} aria-label="Toggle dark and light mode">
			<span aria-hidden="true" className="icon-fallback">
				◐
			</span>
			<span aria-hidden="true" className={`icon moon ${theme === 'dark' ? 'visible' : ''}`}>
				<svg viewBox="0 0 24 24" role="img">
					<path
						d="M14.5 2.2c-1.6 1.7-2.6 4-2.6 6.5 0 5.3 4.3 9.6 9.6 9.6.2 0 .4 0 .6 0A10 10 0 1 1 14.5 2.2z"
						fill="currentColor"
					/>
				</svg>
			</span>
			<span aria-hidden="true" className={`icon sun ${theme === 'light' ? 'visible' : ''}`}>
				<svg viewBox="0 0 24 24" role="img">
					<path
						d="M12 16.5A4.5 4.5 0 1 0 12 7.5a4.5 4.5 0 0 0 0 9zm0-13.5a1 1 0 0 1 1 1v1.2a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1zm0 15.8a1 1 0 0 1 1 1V21a1 1 0 1 1-2 0v-1.2a1 1 0 0 1 1-1zM4 11a1 1 0 1 1 0 2H2.8a1 1 0 1 1 0-2H4zm17.2 0a1 1 0 1 1 0 2H20a1 1 0 1 1 0-2h1.2zM6.1 6.1a1 1 0 0 1 1.4 0l.8.8a1 1 0 0 1-1.4 1.4l-.8-.8a1 1 0 0 1 0-1.4zm11 11a1 1 0 0 1 1.4 0l.8.8a1 1 0 0 1-1.4 1.4l-.8-.8a1 1 0 0 1 0-1.4zm2.2-11a1 1 0 0 1 0 1.4l-.8.8a1 1 0 0 1-1.4-1.4l.8-.8a1 1 0 0 1 1.4 0zm-11 11a1 1 0 0 1 0 1.4l-.8.8a1 1 0 1 1-1.4-1.4l.8-.8a1 1 0 0 1 1.4 0z"
						fill="currentColor"
					/>
				</svg>
			</span>
		</button>
	);
}

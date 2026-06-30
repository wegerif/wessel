import { useEffect, useMemo, useState } from 'react';

const messages = [
	'> booting wessel.exe',
	'> role: developer',
	'> mode: creative x professional',
	'> mission: build memorable web experiences',
];

export default function HeroConsole() {
	const [line, setLine] = useState(0);

	useEffect(() => {
		if (line >= messages.length - 1) {
			return;
		}

		const timer = window.setTimeout(() => {
			setLine((value) => value + 1);
		}, 520);

		return () => window.clearTimeout(timer);
	}, [line]);

	const visibleMessages = useMemo(() => messages.slice(0, line + 1), [line]);

	return (
		<div className="hero-console" aria-label="Website intro console">
			{visibleMessages.map((message) => (
				<p key={message}>{message}</p>
			))}
		</div>
	);
}

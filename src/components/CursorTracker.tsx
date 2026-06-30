import { useEffect, useState } from 'react';

export default function CursorTracker() {
	const [position, setPosition] = useState({ x: 0, y: 0 });

	useEffect(() => {
		document.body.classList.add('has-custom-cursor');

		function onMove(event: MouseEvent) {
			setPosition({
				x: event.clientX,
				y: event.clientY,
			});
		}

		window.addEventListener('mousemove', onMove);

		return () => {
			document.body.classList.remove('has-custom-cursor');
			window.removeEventListener('mousemove', onMove);
		};
	}, []);

	return (
		<>
			<div
				className="cursor-dot"
				style={{ transform: `translate(${position.x - 4}px, ${position.y - 4}px)` }}
				aria-hidden="true"
			></div>
			<div
				className="cursor-ring"
				style={{ transform: `translate(${position.x - 16}px, ${position.y - 16}px)` }}
				aria-hidden="true"
			></div>
			<div className="cursor-coordinates" aria-live="polite">
				X: {position.x} Y: {position.y}
			</div>
		</>
	);
}

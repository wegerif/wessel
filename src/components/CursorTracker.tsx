import { useEffect, useRef, useState } from 'react';

export default function CursorTracker() {
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [isPressed, setIsPressed] = useState(false);
	const rafRef = useRef(0);

	useEffect(() => {
		document.body.classList.add('has-custom-cursor');
		const startX = Math.round(window.innerWidth / 2);
		const startY = Math.round(window.innerHeight / 2);
		const target = { x: startX, y: startY };
		const current = { x: startX, y: startY };
		setPosition({ x: startX, y: startY });

		function onMove(event: MouseEvent) {
			target.x = event.clientX;
			target.y = event.clientY;
		}

		function onDown() {
			setIsPressed(true);
		}

		function onUp() {
			setIsPressed(false);
		}

		function tick() {
			current.x += (target.x - current.x) * 0.22;
			current.y += (target.y - current.y) * 0.22;
			setPosition({ x: Math.round(current.x), y: Math.round(current.y) });
			rafRef.current = window.requestAnimationFrame(tick);
		}

		rafRef.current = window.requestAnimationFrame(tick);
		window.addEventListener('mousemove', onMove);
		window.addEventListener('mousedown', onDown);
		window.addEventListener('mouseup', onUp);

		return () => {
			document.body.classList.remove('has-custom-cursor');
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mousedown', onDown);
			window.removeEventListener('mouseup', onUp);
			window.cancelAnimationFrame(rafRef.current);
		};
	}, []);

	return (
		<>
			<div
				className="cursor-dot"
				style={{ transform: `translate(${position.x - 5}px, ${position.y - 5}px)` }}
				aria-hidden="true"
			></div>
			<div
				className={`cursor-ring ${isPressed ? 'pressed' : ''}`}
				style={{ transform: `translate(${position.x - 18}px, ${position.y - 18}px)` }}
				aria-hidden="true"
			></div>
			<div className="cursor-coordinates" aria-live="polite">
				X: {position.x} Y: {position.y}
			</div>
		</>
	);
}

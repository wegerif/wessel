import { useEffect, useMemo, useRef, useState } from 'react';
import { defaultSpriteCarKey, getSpriteCarByKey, type SpriteCarKey } from '../lib/spriteCars';

const storageKey = 'sprite-car-selection';
const speedStorageKey = 'sprite-car-speed';
const steeringStorageKey = 'sprite-car-steering';
const spriteSize = 16;
const renderScale = 4;
const stackStep = 3;
const carWidth = spriteSize * renderScale;
const footprintHeight = spriteSize * renderScale;
const defaultSpeed = 100;
const defaultSteering = 8;
const rotationSmoothing = 0.22;
const deadzonePx = 10;
const spriteForwardAngleOffset = 0;

type CarState = { x: number; y: number; frame: number; angle: number };
type Particle = { id: number; x: number; y: number; dx: number; dy: number; life: number; size: number; color: string };
type MotionState = { x: number; y: number; angle: number; vx: number; vy: number; initialized: boolean };

export default function SpriteStackFollower() {
	const [selectedCar, setSelectedCar] = useState<SpriteCarKey>(defaultSpriteCarKey);
	const [state, setState] = useState<CarState>({ x: 40, y: 120, frame: 0, angle: 0 });
	const [viewportWidth, setViewportWidth] = useState(1200);
	const [viewportHeight, setViewportHeight] = useState(800);
	const [speed, setSpeed] = useState(defaultSpeed);
	const [steering, setSteering] = useState(defaultSteering);
	const [spriteImage, setSpriteImage] = useState<HTMLImageElement | null>(null);
	const [particles, setParticles] = useState<Particle[]>([]);
	const frameRef = useRef(0);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const speedRef = useRef(defaultSpeed);
	const steeringRef = useRef(defaultSteering);
	const frameCountRef = useRef(getSpriteCarByKey(defaultSpriteCarKey).frames);
	const particleIdRef = useRef(0);
	const particlesRef = useRef<Particle[]>([]);
	const motionRef = useRef<MotionState>({ x: 40, y: 120, angle: 0, vx: 0, vy: 0, initialized: false });

	const carConfig = useMemo(() => getSpriteCarByKey(selectedCar), [selectedCar]);
	const carVisualHeight = footprintHeight + (carConfig.frames - 1) * stackStep;

	function spawnPoofAtCurrentCar() {
		const centerX = motionRef.current.x + carWidth / 2;
		const centerY = motionRef.current.y + footprintHeight / 2;
		const colors = ['#ffffff', '#d5d9e8', '#c4b9ff', '#ece7ff'];
		const created: Particle[] = [];

		for (let i = 0; i < 24; i += 1) {
			const angle = Math.random() * Math.PI * 2;
			const force = 20 + Math.random() * 55;
			created.push({
				id: particleIdRef.current++,
				x: centerX,
				y: centerY,
				dx: Math.cos(angle) * force,
				dy: Math.sin(angle) * force - 12,
				life: 0.55 + Math.random() * 0.35,
				size: 2 + Math.floor(Math.random() * 3),
				color: colors[Math.floor(Math.random() * colors.length)],
			});
		}

		particlesRef.current = [...particlesRef.current, ...created];
		setParticles(particlesRef.current);
	}

	useEffect(() => {
		setViewportWidth(window.innerWidth);
		setViewportHeight(window.innerHeight);

		function onResize() {
			setViewportWidth(window.innerWidth);
			setViewportHeight(window.innerHeight);
		}

		function onCarChange(event: Event) {
			const key = (event as CustomEvent<SpriteCarKey>).detail;
			setSelectedCar(getSpriteCarByKey(key).key);
			spawnPoofAtCurrentCar();
		}

		function onSpeedChange(event: Event) {
			const value = Number((event as CustomEvent<number>).detail);
			if (Number.isFinite(value)) {
				const clamped = Math.max(40, Math.min(300, value));
				speedRef.current = clamped;
				setSpeed(clamped);
			}
		}

		function onSteeringChange(event: Event) {
			const value = Number((event as CustomEvent<number>).detail);
			if (Number.isFinite(value)) {
				const clamped = Math.max(2, Math.min(20, value));
				steeringRef.current = clamped;
				setSteering(clamped);
			}
		}

		const initialCar = getSpriteCarByKey(window.localStorage.getItem(storageKey) ?? defaultSpriteCarKey).key;
		setSelectedCar(initialCar);
		const savedSpeedRaw = window.localStorage.getItem(speedStorageKey);
		const savedSpeed = savedSpeedRaw ? Number(savedSpeedRaw) : defaultSpeed;
		if (Number.isFinite(savedSpeed)) {
			const clampedSpeed = Math.max(40, Math.min(300, savedSpeed));
			speedRef.current = clampedSpeed;
			setSpeed(clampedSpeed);
		}
		const savedSteeringRaw = window.localStorage.getItem(steeringStorageKey);
		const savedSteering = savedSteeringRaw ? Number(savedSteeringRaw) : defaultSteering;
		if (Number.isFinite(savedSteering)) {
			const clampedSteering = Math.max(2, Math.min(20, savedSteering));
			steeringRef.current = clampedSteering;
			setSteering(clampedSteering);
		}
		window.addEventListener('resize', onResize);
		window.addEventListener('sprite-car-change', onCarChange as EventListener);
		window.addEventListener('sprite-car-speed-change', onSpeedChange as EventListener);
		window.addEventListener('sprite-car-steering-change', onSteeringChange as EventListener);

		return () => {
			window.removeEventListener('resize', onResize);
			window.removeEventListener('sprite-car-change', onCarChange as EventListener);
			window.removeEventListener('sprite-car-speed-change', onSpeedChange as EventListener);
			window.removeEventListener('sprite-car-steering-change', onSteeringChange as EventListener);
		};
	}, []);

	useEffect(() => {
		frameCountRef.current = carConfig.frames;
	}, [carConfig.frames]);

	useEffect(() => {
		const image = new Image();
		image.src = carConfig.src;
		image.onload = () => setSpriteImage(image);
	}, [carConfig.src]);

	useEffect(() => {
		const mouse = { x: viewportWidth / 2, y: viewportHeight / 2 };
		let x = motionRef.current.x;
		let y = motionRef.current.y;
		let angle = motionRef.current.angle;
		let vx = motionRef.current.vx;
		let vy = motionRef.current.vy;
		if (!motionRef.current.initialized) {
			x = Math.max(0, viewportWidth / 2 - carWidth / 2);
			y = Math.max(0, viewportHeight / 2 - carVisualHeight / 2);
			motionRef.current.initialized = true;
		}
		let frameFloat = 0;
		let previousTs = performance.now();
		setState({ x: Math.round(x), y: Math.round(y), frame: 0, angle });

		function onMove(event: MouseEvent) {
			mouse.x = event.clientX;
			mouse.y = event.clientY;
		}

		function normalizeAngle(value: number) {
			while (value > Math.PI) {
				value -= Math.PI * 2;
			}
			while (value < -Math.PI) {
				value += Math.PI * 2;
			}
			return value;
		}

		function tick(timestamp: number) {
			const dt = Math.min(0.05, Math.max(0.001, (timestamp - previousTs) / 1000));
			previousTs = timestamp;
			const maxX = Math.max(0, viewportWidth - carWidth - 8);
			const maxY = Math.max(0, viewportHeight - carVisualHeight - 10);
			const carCenterX = x + carWidth / 2;
			const carCenterY = y + footprintHeight / 2;
			const toMouseX = mouse.x - carCenterX;
			const toMouseY = mouse.y - carCenterY;
			const distanceToMouse = Math.hypot(toMouseX, toMouseY);
			const directionX = distanceToMouse > 0.001 ? toMouseX / distanceToMouse : 0;
			const directionY = distanceToMouse > 0.001 ? toMouseY / distanceToMouse : 0;
			const isInsideDeadzone = distanceToMouse <= deadzonePx;
			const desiredVx = isInsideDeadzone ? 0 : directionX * speedRef.current;
			const desiredVy = isInsideDeadzone ? 0 : directionY * speedRef.current;
			const blend = Math.min(1, steeringRef.current * dt);
			vx += (desiredVx - vx) * blend;
			vy += (desiredVy - vy) * blend;
			if (Math.abs(vx) < 0.02) {
				vx = 0;
			}
			if (Math.abs(vy) < 0.02) {
				vy = 0;
			}
			x += vx * dt;
			y += vy * dt;

			if (x < 0) {
				x = 0;
				vx = 0;
			}
			if (x > maxX) {
				x = maxX;
				vx = 0;
			}
			if (y < 12) {
				y = 12;
				vy = 0;
			}
			if (y > maxY) {
				y = maxY;
				vy = 0;
			}

			const targetAngle = distanceToMouse > 0.1 ? Math.atan2(toMouseY, toMouseX) + spriteForwardAngleOffset : angle;
			const shortestDelta = normalizeAngle(targetAngle - angle);
			angle = normalizeAngle(angle + shortestDelta * rotationSmoothing);
			const velocity = Math.hypot(vx, vy);
			frameFloat += Math.min(2, velocity * dt * 0.2);

			setState({
				x: Math.round(x),
				y: Math.round(y),
				frame: Math.floor(frameFloat) % frameCountRef.current,
				angle,
			});
			motionRef.current = { x, y, angle, vx, vy, initialized: true };

			const remainingParticles: Particle[] = [];
			for (const particle of particlesRef.current) {
				const nextLife = particle.life - dt;
				if (nextLife <= 0) {
					continue;
				}
				remainingParticles.push({
					...particle,
					life: nextLife,
					x: particle.x + particle.dx * dt,
					y: particle.y + particle.dy * dt,
					dy: particle.dy + 40 * dt,
				});
			}
			particlesRef.current = remainingParticles;
			setParticles(remainingParticles);

			frameRef.current = window.requestAnimationFrame(tick);
		}

		frameRef.current = window.requestAnimationFrame(tick);
		window.addEventListener('mousemove', onMove);

		return () => {
			window.removeEventListener('mousemove', onMove);
			window.cancelAnimationFrame(frameRef.current);
		};
	}, [carVisualHeight, viewportHeight, viewportWidth]);

	useEffect(() => {
		if (!spriteImage || !canvasRef.current) {
			return;
		}

		const canvas = canvasRef.current;
		canvas.width = carWidth;
		canvas.height = carVisualHeight;
		const context = canvas.getContext('2d');

		if (!context) {
			return;
		}

		context.clearRect(0, 0, canvas.width, canvas.height);
		context.imageSmoothingEnabled = false;

		for (let layer = 0; layer < carConfig.frames; layer += 1) {
			const sourceX = layer * spriteSize;
			const drawY = carVisualHeight - footprintHeight - layer * stackStep;
			const layerCenterX = carWidth / 2;
			const layerCenterY = drawY + footprintHeight / 2;
			const layerRotation = state.angle;

			context.save();
			context.translate(layerCenterX, layerCenterY);
			context.rotate(layerRotation);
			context.drawImage(
				spriteImage,
				sourceX,
				0,
				spriteSize,
				spriteSize,
				-carWidth / 2,
				-footprintHeight / 2,
				carWidth,
				footprintHeight,
			);
			context.restore();
		}
	}, [carConfig.frames, carVisualHeight, carWidth, footprintHeight, spriteImage, state.angle]);

	return (
		<div className="sprite-follower" aria-hidden="true">
			<div
				className="sprite-car"
				style={{
					transform: `translate(${state.x}px, ${state.y}px)`,
				}}
			>
				<canvas
					ref={canvasRef}
					width={carWidth}
					height={carVisualHeight}
					style={{
						width: `${carWidth}px`,
						height: `${carVisualHeight}px`,
						imageRendering: 'pixelated',
					}}
				></canvas>
			</div>
			{particles.map((particle) => (
				<div
					key={particle.id}
					className="sprite-particle"
					style={{
						transform: `translate(${particle.x}px, ${particle.y}px)`,
						width: `${particle.size}px`,
						height: `${particle.size}px`,
						opacity: Math.max(0, Math.min(1, particle.life * 1.2)),
						background: particle.color,
					}}
				></div>
			))}
		</div>
	);
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { loadTuningForCar, spriteCarSelectionStorageKey } from '../lib/carTuning';
import { defaultSpriteCarKey, getSpriteCarByKey, type CarHandlingConfig, type SpriteCarKey } from '../lib/spriteCars';

const spriteSize = 16;
const renderScale = 4;
const stackStep = 3;
const carWidth = spriteSize * renderScale;
const footprintHeight = spriteSize * renderScale;
const spriteForwardAngleOffset = 0;
const headlightBeamHeight = 90;
const boostMultiplier = 1.55;
const boostAccelerationMultiplier = 1.35;
const boostDrainPerSecond = 42;
const boostRegenPerSecond = 26;
const handbrakeTurnMultiplier = 1.8;

type CarState = { x: number; y: number; frame: number; angle: number };
type Particle = { id: number; x: number; y: number; dx: number; dy: number; life: number; size: number; color: string };
type MotionState = { x: number; y: number; angle: number; vx: number; vy: number; initialized: boolean };

export default function SpriteStackFollower() {
	const [selectedCar, setSelectedCar] = useState<SpriteCarKey>(defaultSpriteCarKey);
	const [state, setState] = useState<CarState>({ x: 40, y: 120, frame: 0, angle: 0 });
	const [viewportWidth, setViewportWidth] = useState(1200);
	const [viewportHeight, setViewportHeight] = useState(800);
	const [spriteImage, setSpriteImage] = useState<HTMLImageElement | null>(null);
	const [particles, setParticles] = useState<Particle[]>([]);
	const [isDarkTheme, setIsDarkTheme] = useState(false);
	const frameRef = useRef(0);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const tuningRef = useRef<CarHandlingConfig>(getSpriteCarByKey(defaultSpriteCarKey).handling);
	const frameCountRef = useRef(getSpriteCarByKey(defaultSpriteCarKey).frames);
	const particleIdRef = useRef(0);
	const particlesRef = useRef<Particle[]>([]);
	const motionRef = useRef<MotionState>({ x: 40, y: 120, angle: 0, vx: 0, vy: 0, initialized: false });
	const controlsRef = useRef({ handbrake: false, boost: false, boostCharge: 100 });

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
		setIsDarkTheme(document.documentElement.getAttribute('data-theme') !== 'light');

		function onResize() {
			setViewportWidth(window.innerWidth);
			setViewportHeight(window.innerHeight);
		}

		function onCarChange(event: Event) {
			const key = (event as CustomEvent<SpriteCarKey>).detail;
			const next = getSpriteCarByKey(key).key;
			setSelectedCar(next);
			tuningRef.current = loadTuningForCar(next);
			spawnPoofAtCurrentCar();
		}

		function onTuningChange(event: Event) {
			const detail = (event as CustomEvent<CarHandlingConfig>).detail;
			if (!detail) {
				return;
			}
			tuningRef.current = detail;
		}

		function onThemeChange() {
			setIsDarkTheme(document.documentElement.getAttribute('data-theme') !== 'light');
		}

		function onKeyDown(event: KeyboardEvent) {
			if (event.code === 'Space') {
				controlsRef.current.handbrake = true;
				event.preventDefault();
			}
			if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
				controlsRef.current.boost = true;
			}
		}

		function onKeyUp(event: KeyboardEvent) {
			if (event.code === 'Space') {
				controlsRef.current.handbrake = false;
			}
			if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
				controlsRef.current.boost = false;
			}
		}

		function onWindowBlur() {
			controlsRef.current.handbrake = false;
			controlsRef.current.boost = false;
		}

		const themeObserver = new MutationObserver(onThemeChange);
		themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

		const initialCar = getSpriteCarByKey(
			window.localStorage.getItem(spriteCarSelectionStorageKey) ?? defaultSpriteCarKey,
		).key;
		setSelectedCar(initialCar);
		tuningRef.current = loadTuningForCar(initialCar);

		window.addEventListener('resize', onResize);
		window.addEventListener('sprite-car-change', onCarChange as EventListener);
		window.addEventListener('sprite-car-tuning-change', onTuningChange as EventListener);
		window.addEventListener('keydown', onKeyDown);
		window.addEventListener('keyup', onKeyUp);
		window.addEventListener('blur', onWindowBlur);

		return () => {
			window.removeEventListener('resize', onResize);
			window.removeEventListener('sprite-car-change', onCarChange as EventListener);
			window.removeEventListener('sprite-car-tuning-change', onTuningChange as EventListener);
			window.removeEventListener('keydown', onKeyDown);
			window.removeEventListener('keyup', onKeyUp);
			window.removeEventListener('blur', onWindowBlur);
			themeObserver.disconnect();
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
			const carCenterY = y + (carVisualHeight - footprintHeight / 2);
			const toMouseX = mouse.x - carCenterX;
			const toMouseY = mouse.y - carCenterY;
			const distanceToMouse = Math.hypot(toMouseX, toMouseY);
			const inDeadzone = distanceToMouse <= tuningRef.current.deadzone;
			const handbrakeActive = controlsRef.current.handbrake;
			const boostActive = controlsRef.current.boost && controlsRef.current.boostCharge > 1 && !inDeadzone;
			if (boostActive) {
				controlsRef.current.boostCharge = Math.max(0, controlsRef.current.boostCharge - boostDrainPerSecond * dt);
			} else {
				controlsRef.current.boostCharge = Math.min(100, controlsRef.current.boostCharge + boostRegenPerSecond * dt);
			}
			const effectiveTopSpeed = tuningRef.current.topSpeed * (boostActive ? boostMultiplier : 1);
			const effectiveAcceleration = tuningRef.current.acceleration * (boostActive ? boostAccelerationMultiplier : 1);
			const targetAngle = distanceToMouse > 0.001 ? Math.atan2(toMouseY, toMouseX) + spriteForwardAngleOffset : angle;
			const shortestDelta = normalizeAngle(targetAngle - angle);
			const maxTurnStep = tuningRef.current.steering * dt * (handbrakeActive ? handbrakeTurnMultiplier : 1);
			const clampedTurn = Math.max(-maxTurnStep, Math.min(maxTurnStep, shortestDelta));
			angle = normalizeAngle(angle + clampedTurn);

			const forwardX = Math.cos(angle);
			const forwardY = Math.sin(angle);
			const sideX = -forwardY;
			const sideY = forwardX;
			let forwardSpeed = vx * forwardX + vy * forwardY;
			let lateralSpeed = vx * sideX + vy * sideY;
			const brakingLimitedSpeed = Math.sqrt(Math.max(0, 2 * effectiveAcceleration * distanceToMouse));
			let desiredForwardSpeed = Math.min(effectiveTopSpeed, brakingLimitedSpeed);
			if (inDeadzone) {
				desiredForwardSpeed = Math.min(desiredForwardSpeed, Math.max(12, distanceToMouse * 8));
			}
			if (handbrakeActive) {
				desiredForwardSpeed = Math.min(desiredForwardSpeed, Math.max(0, distanceToMouse * 2.9));
			}
			const accelerationStep = effectiveAcceleration * dt;
			if (forwardSpeed < desiredForwardSpeed) {
				forwardSpeed = Math.min(desiredForwardSpeed, forwardSpeed + accelerationStep);
			} else if (forwardSpeed > desiredForwardSpeed) {
				forwardSpeed = Math.max(desiredForwardSpeed, forwardSpeed - accelerationStep);
			}
			if (handbrakeActive) {
				forwardSpeed = Math.max(0, forwardSpeed - accelerationStep * 1.8);
			}

			const lateralDecay = Math.max(0, 1 - (2.8 + tuningRef.current.steering * 0.9) * dt * (handbrakeActive ? 0.25 : 1));
			lateralSpeed *= lateralDecay;
			if (handbrakeActive && maxTurnStep > 0.0001) {
				const steerFactor = clampedTurn / maxTurnStep;
				lateralSpeed += steerFactor * effectiveTopSpeed * 0.9 * dt;
			}
			const targetGrip = Math.min(1, Math.max(0, 1 - distanceToMouse / Math.max(40, tuningRef.current.deadzone * 6)));
			lateralSpeed *= 1 - targetGrip * 0.72;
			if (inDeadzone) {
				lateralSpeed *= Math.max(0, 1 - 6.8 * dt);
			}

			vx = forwardX * forwardSpeed + sideX * lateralSpeed;
			vy = forwardY * forwardSpeed + sideY * lateralSpeed;
			const combinedSpeed = Math.hypot(vx, vy);
			const speedCap = effectiveTopSpeed * (handbrakeActive ? 1.08 : 1);
			if (combinedSpeed > speedCap) {
				const speedScale = speedCap / combinedSpeed;
				vx *= speedScale;
				vy *= speedScale;
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

			const arrivalSnapRadius = Math.max(1.5, tuningRef.current.deadzone * 0.22);
			if (distanceToMouse <= arrivalSnapRadius && Math.hypot(vx, vy) < 28) {
				x = mouse.x - carWidth / 2;
				y = mouse.y - (carVisualHeight - footprintHeight / 2);
				x = Math.max(0, Math.min(maxX, x));
				y = Math.max(12, Math.min(maxY, y));
				vx = 0;
				vy = 0;
			}

			if (boostActive && Math.random() < dt * 32) {
				const rearX = x + carWidth / 2 - forwardX * 24;
				const rearY = y + (carVisualHeight - footprintHeight / 2) - forwardY * 24;
				const fireColors = ['#ffd36a', '#ff8a3d', '#5de2ff'];
				const boostParticle: Particle = {
					id: particleIdRef.current++,
					x: rearX,
					y: rearY,
					dx: -forwardX * (60 + Math.random() * 70) + sideX * (Math.random() * 40 - 20),
					dy: -forwardY * (60 + Math.random() * 70) + sideY * (Math.random() * 40 - 20),
					life: 0.16 + Math.random() * 0.16,
					size: 2 + Math.floor(Math.random() * 2),
					color: fireColors[Math.floor(Math.random() * fireColors.length)],
				};
				particlesRef.current = [...particlesRef.current, boostParticle];
			}

			frameFloat += Math.min(2, Math.hypot(vx, vy) * dt * 0.2);

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
	}, [carConfig.frames, carVisualHeight, spriteImage, state.angle]);

	const headlightBeams = useMemo(() => {
		if (!isDarkTheme) {
			return [];
		}

		const centerX = carWidth / 2;
		const centerY = carVisualHeight - footprintHeight / 2;
		const baseLayerTopOffset = carVisualHeight - footprintHeight;
		const cos = Math.cos(state.angle);
		const sin = Math.sin(state.angle);

		return carConfig.headlights.map((light, index) => {
			const localX = light.x - centerX;
			const localY = light.y + baseLayerTopOffset - centerY;
			const rotatedX = localX * cos - localY * sin;
			const rotatedY = localX * sin + localY * cos;
			return {
				id: `${carConfig.key}-${index}`,
				x: state.x + centerX + rotatedX,
				y: state.y + centerY + rotatedY - headlightBeamHeight / 2,
			};
		});
	}, [carConfig.headlights, carConfig.key, carVisualHeight, isDarkTheme, state.angle, state.x, state.y]);

	return (
		<div className="sprite-follower" aria-hidden="true">
			{headlightBeams.map((beam) => (
				<div
					key={beam.id}
					className="sprite-headlight"
					style={{
						transform: `translate(${beam.x}px, ${beam.y}px) rotate(${state.angle}rad)`,
					}}
				></div>
			))}
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

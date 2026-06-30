import { useEffect, useMemo, useState } from 'react';
import { defaultSpriteCarKey, getSpriteCarByKey, spriteCars, type SpriteCarKey } from '../lib/spriteCars';

const storageKey = 'sprite-car-selection';
const speedStorageKey = 'sprite-car-speed';
const steeringStorageKey = 'sprite-car-steering';
const defaultSpeed = 100;
const defaultSteering = 8;

function readSelectedCar(): SpriteCarKey {
	const saved = window.localStorage.getItem(storageKey);
	return getSpriteCarByKey(saved ?? defaultSpriteCarKey).key;
}

export default function CarSelector() {
	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState<SpriteCarKey>(defaultSpriteCarKey);
	const [speed, setSpeed] = useState(defaultSpeed);
	const [steering, setSteering] = useState(defaultSteering);

	useEffect(() => {
		const current = readSelectedCar();
		setSelected(current);
		window.localStorage.setItem(storageKey, current);
		window.dispatchEvent(new CustomEvent('sprite-car-change', { detail: current }));

		const savedSpeedRaw = window.localStorage.getItem(speedStorageKey);
		const savedSpeed = savedSpeedRaw ? Number(savedSpeedRaw) : defaultSpeed;
		const validSpeed = Number.isFinite(savedSpeed) ? Math.min(300, Math.max(40, savedSpeed)) : defaultSpeed;
		setSpeed(validSpeed);
		window.localStorage.setItem(speedStorageKey, String(validSpeed));
		window.dispatchEvent(new CustomEvent('sprite-car-speed-change', { detail: validSpeed }));

		const savedSteeringRaw = window.localStorage.getItem(steeringStorageKey);
		const savedSteering = savedSteeringRaw ? Number(savedSteeringRaw) : defaultSteering;
		const validSteering = Number.isFinite(savedSteering)
			? Math.min(20, Math.max(2, savedSteering))
			: defaultSteering;
		setSteering(validSteering);
		window.localStorage.setItem(steeringStorageKey, String(validSteering));
		window.dispatchEvent(new CustomEvent('sprite-car-steering-change', { detail: validSteering }));
	}, []);

	useEffect(() => {
		function onWindowClick() {
			setOpen(false);
		}

		window.addEventListener('click', onWindowClick);
		return () => window.removeEventListener('click', onWindowClick);
	}, []);

	const selectedLabel = useMemo(() => getSpriteCarByKey(selected).label, [selected]);

	function chooseCar(next: SpriteCarKey) {
		setSelected(next);
		window.localStorage.setItem(storageKey, next);
		window.dispatchEvent(new CustomEvent('sprite-car-change', { detail: next }));
		setOpen(false);
	}

	function onSpeedChange(value: number) {
		setSpeed(value);
		window.localStorage.setItem(speedStorageKey, String(value));
		window.dispatchEvent(new CustomEvent('sprite-car-speed-change', { detail: value }));
	}

	function onSteeringChange(value: number) {
		setSteering(value);
		window.localStorage.setItem(steeringStorageKey, String(value));
		window.dispatchEvent(new CustomEvent('sprite-car-steering-change', { detail: value }));
	}

	return (
		<div className="car-selector" onClick={(event) => event.stopPropagation()}>
			<button type="button" className="car-button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
				<span aria-hidden="true">🚘</span>
				<span className="label">{selectedLabel}</span>
			</button>
			{open ? (
				<div className="car-menu">
					<div className="speed-control">
						<label htmlFor="car-speed">Speed: {speed}px/s</label>
						<input
							id="car-speed"
							type="range"
							min={40}
							max={300}
							step={10}
							value={speed}
							onChange={(event) => onSpeedChange(Number(event.target.value))}
						/>
					</div>
					<div className="speed-control">
						<label htmlFor="car-steering">Steering smoothness: {steering.toFixed(1)}</label>
						<input
							id="car-steering"
							type="range"
							min={2}
							max={20}
							step={0.5}
							value={steering}
							onChange={(event) => onSteeringChange(Number(event.target.value))}
						/>
					</div>
					{spriteCars.map((car) => (
						<button
							key={car.key}
							type="button"
							className={`car-option ${selected === car.key ? 'active' : ''}`}
							onClick={() => chooseCar(car.key)}
						>
							{car.label}
						</button>
					))}
				</div>
			) : null}
		</div>
	);
}

import { useEffect, useMemo, useState } from 'react';
import {
	defaultSpriteCarKey,
	getCarHandlingByKey,
	getSpriteCarByKey,
	spriteCars,
	type CarHandlingConfig,
	type SpriteCarKey,
} from '../lib/spriteCars';
import {
	clampTuning,
	getTuningStorageKey,
	loadTuningForCar,
	spriteCarSelectionStorageKey,
} from '../lib/carTuning';

type CarTuning = CarHandlingConfig;

function readSelectedCar(): SpriteCarKey {
	const saved = window.localStorage.getItem(spriteCarSelectionStorageKey);
	return getSpriteCarByKey(saved ?? defaultSpriteCarKey).key;
}

export default function CarSelector() {
	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState<SpriteCarKey>(defaultSpriteCarKey);
	const [tuning, setTuning] = useState<CarTuning>(() => getCarHandlingByKey(defaultSpriteCarKey));

	useEffect(() => {
		const current = readSelectedCar();
		setSelected(current);
		window.localStorage.setItem(spriteCarSelectionStorageKey, current);
		window.dispatchEvent(new CustomEvent('sprite-car-change', { detail: current }));
	}, []);

	useEffect(() => {
		const loaded = loadTuningForCar(selected);
		setTuning(loaded);
		window.dispatchEvent(new CustomEvent('sprite-car-tuning-change', { detail: loaded }));
	}, [selected]);

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
		window.localStorage.setItem(spriteCarSelectionStorageKey, next);
		window.dispatchEvent(new CustomEvent('sprite-car-change', { detail: next }));
		setOpen(false);
	}

	function updateTuning(next: CarTuning) {
		const clamped = clampTuning(next);
		setTuning(clamped);
		window.localStorage.setItem(getTuningStorageKey(selected), JSON.stringify(clamped));
		window.dispatchEvent(new CustomEvent('sprite-car-tuning-change', { detail: clamped }));
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
						<label htmlFor="car-speed">Top speed: {Math.round(tuning.topSpeed)}px/s</label>
						<input
							id="car-speed"
							type="range"
							min={40}
							max={300}
							step={10}
							value={tuning.topSpeed}
							onChange={(event) =>
								updateTuning({
									...tuning,
									topSpeed: Number(event.target.value),
								})
							}
						/>
					</div>
					<div className="speed-control">
						<label htmlFor="car-acceleration">Acceleration: {Math.round(tuning.acceleration)}px/s²</label>
						<input
							id="car-acceleration"
							type="range"
							min={60}
							max={520}
							step={10}
							value={tuning.acceleration}
							onChange={(event) =>
								updateTuning({
									...tuning,
									acceleration: Number(event.target.value),
								})
							}
						/>
					</div>
					<div className="speed-control">
						<label htmlFor="car-steering">Steering rate: {tuning.steering.toFixed(1)}rad/s</label>
						<input
							id="car-steering"
							type="range"
							min={2}
							max={20}
							step={0.5}
							value={tuning.steering}
							onChange={(event) =>
								updateTuning({
									...tuning,
									steering: Number(event.target.value),
								})
							}
						/>
					</div>
					<div className="speed-control">
						<label htmlFor="car-deadzone">Deadzone: {Math.round(tuning.deadzone)}px</label>
						<input
							id="car-deadzone"
							type="range"
							min={4}
							max={28}
							step={1}
							value={tuning.deadzone}
							onChange={(event) =>
								updateTuning({
									...tuning,
									deadzone: Number(event.target.value),
								})
							}
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

import { useEffect, useMemo, useRef, useState } from 'react';
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
const previewSpriteSize = 16;
const previewRenderScale = 3;
const previewStackStep = 2;
const previewCarWidth = previewSpriteSize * previewRenderScale;
const previewFootprintHeight = previewSpriteSize * previewRenderScale;
const previewCanvasWidth = 140;
const previewCanvasHeight = 104;

function readSelectedCar(): SpriteCarKey {
	const saved = window.localStorage.getItem(spriteCarSelectionStorageKey);
	return getSpriteCarByKey(saved ?? defaultSpriteCarKey).key;
}

export default function CarSelector() {
	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState<SpriteCarKey>(defaultSpriteCarKey);
	const [tuning, setTuning] = useState<CarTuning>(() => getCarHandlingByKey(defaultSpriteCarKey));
	const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
	const previewFrameRef = useRef(0);

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
	const selectedCarConfig = useMemo(() => getSpriteCarByKey(selected), [selected]);

	useEffect(() => {
		if (!open || !previewCanvasRef.current) {
			return;
		}

		const canvas = previewCanvasRef.current;
		const context = canvas.getContext('2d');
		if (!context) {
			return;
		}
		const ctx = context;

		const image = new Image();
		let angle = 0;
		let ready = false;
		image.src = selectedCarConfig.src;
		image.onload = () => {
			ready = true;
		};

		function draw() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.imageSmoothingEnabled = false;
			if (ready) {
				angle += 0.016;
				const carVisualHeight = previewFootprintHeight + (selectedCarConfig.frames - 1) * previewStackStep;
				const centerX = canvas.width / 2;
				const centerY = canvas.height / 2 + 4;
				for (let layer = 0; layer < selectedCarConfig.frames; layer += 1) {
					const sourceX = layer * previewSpriteSize;
					const drawY = centerY - carVisualHeight / 2 + (carVisualHeight - previewFootprintHeight - layer * previewStackStep);
					const layerCenterY = drawY + previewFootprintHeight / 2;

					ctx.save();
					ctx.translate(centerX, layerCenterY);
					ctx.rotate(angle);
					ctx.drawImage(
						image,
						sourceX,
						0,
						previewSpriteSize,
						previewSpriteSize,
						-previewCarWidth / 2,
						-previewFootprintHeight / 2,
						previewCarWidth,
						previewFootprintHeight,
					);
					ctx.restore();
				}
			}
			previewFrameRef.current = window.requestAnimationFrame(draw);
		}

		previewFrameRef.current = window.requestAnimationFrame(draw);
		return () => {
			window.cancelAnimationFrame(previewFrameRef.current);
		};
	}, [open, selectedCarConfig.frames, selectedCarConfig.src]);

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
					<div className="car-preview">
						<canvas
							ref={previewCanvasRef}
							className="car-preview-canvas"
							width={previewCanvasWidth}
							height={previewCanvasHeight}
						></canvas>
						<p className="car-controls-hint">Space = handbrake · Shift = boost</p>
					</div>
					<div className="speed-control">
						<label htmlFor="car-speed">Top speed: {Math.round(tuning.topSpeed)}px/s</label>
						<input
							id="car-speed"
							type="range"
							min={30}
							max={500}
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
							min={30}
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
							min={1.5}
							max={25}
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

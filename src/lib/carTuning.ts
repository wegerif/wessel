import { getCarHandlingByKey, type CarHandlingConfig, type SpriteCarKey } from './spriteCars';

export const spriteCarSelectionStorageKey = 'sprite-car-selection';

export function getTuningStorageKey(carKey: string) {
	return `sprite-car-tuning:${carKey}`;
}

export function clampTuning(tuning: CarHandlingConfig): CarHandlingConfig {
	return {
		topSpeed: Math.max(40, Math.min(300, tuning.topSpeed)),
		acceleration: Math.max(60, Math.min(520, tuning.acceleration)),
		steering: Math.max(2, Math.min(20, tuning.steering)),
		deadzone: Math.max(4, Math.min(28, tuning.deadzone)),
	};
}

export function loadTuningForCar(carKey: SpriteCarKey): CarHandlingConfig {
	const defaults = getCarHandlingByKey(carKey);
	const raw = window.localStorage.getItem(getTuningStorageKey(carKey));
	if (!raw) {
		return clampTuning(defaults);
	}

	try {
		const parsed = JSON.parse(raw) as Partial<CarHandlingConfig>;
		return clampTuning({
			topSpeed: Number(parsed.topSpeed ?? defaults.topSpeed),
			acceleration: Number(parsed.acceleration ?? defaults.acceleration),
			steering: Number(parsed.steering ?? defaults.steering),
			deadzone: Number(parsed.deadzone ?? defaults.deadzone),
		});
	} catch {
		return clampTuning(defaults);
	}
}

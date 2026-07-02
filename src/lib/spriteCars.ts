import blueCar from '../assets/Sprite stack cars/BlueCar.png';
import brownMotorcycle from '../assets/Sprite stack cars/BrownMotorcycle.png';
import greenBigCar from '../assets/Sprite stack cars/GreenBigCar.png';
import greenCar from '../assets/Sprite stack cars/GreenCar.png';
import purpleCar from '../assets/Sprite stack cars/PurpleCar.png';
import redCar from '../assets/Sprite stack cars/RedCar.png';
import redMotorcycle from '../assets/Sprite stack cars/RedMotorcycle.png';
import whiteMotorcycle from '../assets/Sprite stack cars/WhiteMotorcycle.png';
import yellowCar from '../assets/Sprite stack cars/YellowCar.png';

export type SpriteCarKey =
	| 'blue-car'
	| 'green-car'
	| 'purple-car'
	| 'red-car'
	| 'yellow-car'
	| 'green-big-car'
	| 'red-motorcycle'
	| 'brown-motorcycle'
	| 'white-motorcycle';

export type SpriteCarConfig = {
	key: SpriteCarKey;
	label: string;
	src: string;
	frames: number;
	handling: CarHandlingConfig;
	headlights: Array<{ x: number; y: number }>;
};

export type CarHandlingConfig = {
	topSpeed: number;
	acceleration: number;
	steering: number;
	deadzone: number;
};

export const spriteCars: SpriteCarConfig[] = [
	{
		key: 'blue-car',
		label: 'Blue Car',
		src: blueCar.src,
		frames: 9,
		handling: { topSpeed: 120, acceleration: 190, steering: 6.5, deadzone: 10 },
		headlights: [
			{ x: 56, y: 24 },
			{ x: 56, y: 36 },
		],
	},
	{
		key: 'green-car',
		label: 'Green Car',
		src: greenCar.src,
		frames: 7,
		handling: { topSpeed: 130, acceleration: 210, steering: 7.2, deadzone: 10 },
		headlights: [
			{ x: 56, y: 24 },
			{ x: 56, y: 36 },
		],
	},
	{
		key: 'purple-car',
		label: 'Purple Car',
		src: purpleCar.src,
		frames: 8,
		handling: { topSpeed: 128, acceleration: 205, steering: 7, deadzone: 10 },
		headlights: [
			{ x: 56, y: 24 },
			{ x: 56, y: 36 },
		],
	},
	{
		key: 'red-car',
		label: 'Red Car',
		src: redCar.src,
		frames: 8,
		handling: { topSpeed: 135, acceleration: 220, steering: 7.4, deadzone: 10 },
		headlights: [
			{ x: 56, y: 24 },
			{ x: 56, y: 36 },
		],
	},
	{
		key: 'yellow-car',
		label: 'Yellow Car',
		src: yellowCar.src,
		frames: 12,
		handling: { topSpeed: 145, acceleration: 240, steering: 7.8, deadzone: 10 },
		headlights: [
			{ x: 56, y: 24 },
			{ x: 56, y: 36 },
		],
	},
	{
		key: 'green-big-car',
		label: 'Green Big Car',
		src: greenBigCar.src,
		frames: 10,
		handling: { topSpeed: 102, acceleration: 120, steering: 5.2, deadzone: 12 },
		headlights: [
			{ x: 56, y: 24 },
			{ x: 56, y: 36 },
		],
	},
	{
		key: 'red-motorcycle',
		label: 'Red Motorcycle',
		src: redMotorcycle.src,
		frames: 10,
		handling: { topSpeed: 165, acceleration: 290, steering: 10.2, deadzone: 8 },
		headlights: [{ x: 58, y: 30 }],
	},
	{
		key: 'brown-motorcycle',
		label: 'Brown Motorcycle',
		src: brownMotorcycle.src,
		frames: 10,
		handling: { topSpeed: 160, acceleration: 280, steering: 10, deadzone: 8 },
		headlights: [{ x: 58, y: 30 }],
	},
	{
		key: 'white-motorcycle',
		label: 'White Motorcycle',
		src: whiteMotorcycle.src,
		frames: 9,
		handling: { topSpeed: 162, acceleration: 285, steering: 10.1, deadzone: 8 },
		headlights: [{ x: 58, y: 30 }],
	},
];

export const defaultSpriteCarKey: SpriteCarKey = 'red-car';

export function getSpriteCarByKey(key: string) {
	return spriteCars.find((car) => car.key === key) ?? spriteCars.find((car) => car.key === defaultSpriteCarKey)!;
}

export function getCarHandlingByKey(key: string) {
	return getSpriteCarByKey(key).handling;
}

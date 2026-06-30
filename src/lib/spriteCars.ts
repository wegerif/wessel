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
};

export const spriteCars: SpriteCarConfig[] = [
	{ key: 'blue-car', label: 'Blue Car', src: blueCar.src, frames: 9 },
	{ key: 'green-car', label: 'Green Car', src: greenCar.src, frames: 7 },
	{ key: 'purple-car', label: 'Purple Car', src: purpleCar.src, frames: 8 },
	{ key: 'red-car', label: 'Red Car', src: redCar.src, frames: 8 },
	{ key: 'yellow-car', label: 'Yellow Car', src: yellowCar.src, frames: 12 },
	{ key: 'green-big-car', label: 'Green Big Car', src: greenBigCar.src, frames: 10 },
	{ key: 'red-motorcycle', label: 'Red Motorcycle', src: redMotorcycle.src, frames: 10 },
	{ key: 'brown-motorcycle', label: 'Brown Motorcycle', src: brownMotorcycle.src, frames: 10 },
	{ key: 'white-motorcycle', label: 'White Motorcycle', src: whiteMotorcycle.src, frames: 9 },
];

export const defaultSpriteCarKey: SpriteCarKey = 'red-car';

export function getSpriteCarByKey(key: string) {
	return spriteCars.find((car) => car.key === key) ?? spriteCars.find((car) => car.key === defaultSpriteCarKey)!;
}

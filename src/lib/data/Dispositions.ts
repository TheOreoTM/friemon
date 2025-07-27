import { Disposition } from '../types/interfaces';

export const DISPOSITIONS: { [key: string]: Disposition } = {
	calm: {
		name: 'Calm',
		increasedStat: 'magicDefense',
		decreasedStat: 'attack'
	},
	fierce: {
		name: 'Fierce',
		increasedStat: 'attack',
		decreasedStat: 'magicDefense'
	},
	studious: {
		name: 'Studious',
		increasedStat: 'magicAttack',
		decreasedStat: 'defense'
	},
	stoic: {
		name: 'Stoic',
		increasedStat: 'defense',
		decreasedStat: 'magicAttack'
	},
	swift: {
		name: 'Swift',
		increasedStat: 'speed',
		decreasedStat: 'hp'
	},
	hardy: {
		name: 'Hardy',
		increasedStat: 'hp',
		decreasedStat: 'speed'
	},
	balanced: {
		name: 'Balanced',
		increasedStat: 'hp',
		decreasedStat: 'hp' // No actual change
	}
};

export const getRandomDisposition = (): Disposition => {
	const keys = Object.keys(DISPOSITIONS);
	const randomKey = keys[Math.floor(Math.random() * keys.length)];
	return DISPOSITIONS[randomKey];
};

import { Disposition } from '../types/interfaces';
import { createDisposition } from '../character/Disposition';

export const DISPOSITIONS: { [key: string]: Disposition } = {
	calm: createDisposition({
		name: 'Calm',
		increasedStat: 'magicDefense',
		decreasedStat: 'attack'
	}),
	fierce: createDisposition({
		name: 'Fierce',
		increasedStat: 'attack',
		decreasedStat: 'magicDefense'
	}),
	studious: createDisposition({
		name: 'Studious',
		increasedStat: 'magicAttack',
		decreasedStat: 'defense'
	}),
	stoic: createDisposition({
		name: 'Stoic',
		increasedStat: 'defense',
		decreasedStat: 'magicAttack'
	}),
	swift: createDisposition({
		name: 'Swift',
		increasedStat: 'speed',
		decreasedStat: 'hp'
	}),
	hardy: createDisposition({
		name: 'Hardy',
		increasedStat: 'hp',
		decreasedStat: 'speed'
	}),
	balanced: createDisposition({
		name: 'Balanced',
		increasedStat: 'hp',
		decreasedStat: 'hp' // No actual change
	})
};

export const getRandomDisposition = (): Disposition => {
	const keys = Object.keys(DISPOSITIONS);
	const randomKey = keys[Math.floor(Math.random() * keys.length)];
	return DISPOSITIONS[randomKey];
};

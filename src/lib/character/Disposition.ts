import { Disposition } from '../types/interfaces';

export const createDisposition = (data: Disposition): Disposition => {
	return {
		name: data.name,
		increasedStat: data.increasedStat,
		decreasedStat: data.decreasedStat
	};
};

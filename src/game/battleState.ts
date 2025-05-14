import { type IBattleState } from './types';
import { Battler as BattlerClass } from './battler';

export class BattleState implements IBattleState {
	public id: string;
	public players: { userId: string; team: BattlerClass[] }[];
	public activeBattlers: BattlerClass[];
	public turn: number = 0;
	public log: string[] = [];
	public weather: 'none' | 'sun' | 'rain' | 'hail' | 'sandstorm' | 'snow' = 'none';
	public fieldEffect: 'none' = 'none';

	constructor(player1Id: string, player1Team: BattlerClass[], player2Id: string, player2Team: BattlerClass[]) {
		this.id = `battle-${Date.now()}`;
		this.players = [
			{ userId: player1Id, team: player1Team },
			{ userId: player2Id, team: player2Team }
		];
		this.activeBattlers = [player1Team[0], player2Team[0]];
	}

	addLogEntry(entry: string): void {
		this.log.push(entry);
	}

	nextTurn(): void {
		this.turn++;
		this.addLogEntry(`--- Turn ${this.turn} ---`);
	}

	getBattlerById(battlerId: string): BattlerClass | undefined {
		for (const player of this.players) {
			const battler = player.team.find((b) => b.id === battlerId);
			if (battler) return battler;
		}
		return undefined;
	}

	getOpponent(battler: BattlerClass): BattlerClass | undefined {
		const player1Battler = this.activeBattlers[0];
		const player2Battler = this.activeBattlers[1];

		if (battler.id === player1Battler.id) {
			return player2Battler;
		} else if (battler.id === player2Battler.id) {
			return player1Battler;
		}
		return undefined;
	}
}

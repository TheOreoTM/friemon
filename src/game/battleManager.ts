import type { Battler } from '@src/game/battler';
import { BattleState } from '@src/game/battleState';

export class BattleManager {
	private activeBattles: Map<string, BattleState> = new Map();

	createBattle(player1Id: string, player1Team: Battler[], player2Id: string, player2Team: Battler[]): BattleState {
		const battle = new BattleState(player1Id, player1Team, player2Id, player2Team);
		this.activeBattles.set(battle.id, battle);
		return battle;
	}

	getBattle(battleId: string): BattleState | undefined {
		return this.activeBattles.get(battleId);
	}

	endBattle(battleId: string): void {
		this.activeBattles.delete(battleId);
	}

	findBattleByUserId(userId: string): BattleState | undefined {
		for (const battle of this.activeBattles.values()) {
			if (battle.players.some((p) => p.userId === userId)) {
				return battle;
			}
		}
		return undefined;
	}
}

import { Battle } from './Battle';
import { BattleInterface } from './BattleInterface';
import { Character } from '../character/Character';
import { getTechniqueByName } from '../data/Techniques';
import { STARTER_CHARACTERS } from '../data/Characters';

export interface BattleSession {
	id: string;
	battle: Battle;
	interface: BattleInterface;
	player1Id: string;
	player2Id: string;
	createdAt: Date;
	timeoutCount: Map<string, number>;
	lastActionTime: Date;
	playerActions: Map<string, boolean>;
	currentTurn: number;
}

export class BattleManager {
	private static activeBattles: Map<string, BattleSession> = new Map();


	public static createPlayerBattle(player1Id: string, player2Id: string): BattleSession {
		// Validate player IDs
		if (!player1Id || !player2Id || player1Id === player2Id) {
			throw new Error('Invalid player IDs for battle creation');
		}

		// Check if either player already has a battle
		if (this.getBattle(player1Id) || this.getBattle(player2Id)) {
			throw new Error('One or both players are already in a battle');
		}

		// TODO: Fetch both players' teams from database
		const player1Team = Object.values(STARTER_CHARACTERS)
			.slice(0, 3)
			.map((data) => Character.fromData(data));

		const player2Team = Object.values(STARTER_CHARACTERS)
			.slice(3, 6)
			.map((data) => Character.fromData(data));

		try {
			const battle = new Battle(player1Team, player2Team);
			const battleInterface = new BattleInterface(battle);
			
			// Validate initial battle state
			const validation = battle.validateBattleState();
			if (!validation.valid) {
				throw new Error(`Invalid battle state: ${validation.errors.join(', ')}`);
			}

		const session: BattleSession = {
			id: `${player1Id}_vs_${player2Id}_${Date.now()}`,
			battle,
			interface: battleInterface,
			player1Id,
			player2Id,
			createdAt: new Date(),
			timeoutCount: new Map([[player1Id, 0], [player2Id, 0]]),
			lastActionTime: new Date(),
			playerActions: new Map([[player1Id, false], [player2Id, false]]),
			currentTurn: 1
		};

			// Store battle for both players
			this.activeBattles.set(player1Id, session);
			this.activeBattles.set(player2Id, session);
			return session;
		} catch (error) {
			console.error('Error creating battle:', error);
			throw new Error('Failed to create battle: ' + (error instanceof Error ? error.message : 'Unknown error'));
		}
	}

	public static getBattle(userId: string): BattleSession | null {
		if (!userId) {
			return null;
		}
		return this.activeBattles.get(userId) || null;
	}

	public static getBattleById(battleId: string): BattleSession | null {
		return this.activeBattles.get(battleId) || null;
	}

	public static async executePlayerAction(
		userId: string,
		action: 'attack' | 'switch' | 'item' | 'flee',
		target?: string
	): Promise<{ success: boolean; message: string; battleComplete?: boolean }> {
		const session = this.getBattle(userId);
		if (!session) {
			return { success: false, message: 'Battle not found!' };
		}

		// Check if player has already acted this turn
		if (session.playerActions.get(userId)) {
			return { success: false, message: 'You have already acted this turn! Wait for your opponent.' };
		}

		const { battle } = session;
		const isPlayer1 = userId === session.player1Id;
		const currentCharacter = isPlayer1 ? battle.state.userCharacter : battle.state.opponentCharacter;

		if (!currentCharacter || currentCharacter.isDefeated()) {
			return { success: false, message: 'No active character or character is defeated!' };
		}

		let actionResult = '';

		// Validate battle state before processing action
		const validation = battle.validateBattleState();
		if (!validation.valid) {
			console.error('Invalid battle state:', validation.errors);
			return { success: false, message: 'Battle state is corrupted. Please contact support.' };
		}

		try {
			switch (action) {
				case 'attack':
					if (!target) {
						return { success: false, message: 'No technique specified!' };
					}

					const technique = getTechniqueByName(target);
					if (!technique) {
						return { success: false, message: 'Technique not found!' };
					}

					const hasKnownTechnique = currentCharacter.techniques.some(techName => 
						techName.toLowerCase() === technique.name.toLowerCase()
					);
					
					if (!hasKnownTechnique) {
						return { success: false, message: 'Character does not know this technique!' };
					}

					const targetCharacter = isPlayer1 ? battle.state.opponentCharacter : battle.state.userCharacter;
					if (!targetCharacter || targetCharacter.isDefeated()) {
						return { success: false, message: 'No valid target!' };
					}

					const success = battle.executeTechnique(currentCharacter, targetCharacter, technique);
					actionResult = success ? `${currentCharacter.name} used ${technique.name}!` : `${technique.name} failed!`;
					break;

				case 'switch':
					if (!target) {
						return { success: false, message: 'No character specified!' };
					}

					const party = isPlayer1 ? battle.state.userParty : battle.state.opponentParty;
					const switchTarget = party.find((char) => char.name.toLowerCase() === target.toLowerCase());

					if (!switchTarget) {
						return { success: false, message: 'Character not found in team!' };
					}

					if (switchTarget.isDefeated()) {
						return { success: false, message: 'Cannot switch to defeated character!' };
					}

					if (switchTarget === currentCharacter) {
						return { success: false, message: 'Character is already active!' };
					}

					battle.switchCharacterByObject(switchTarget);
					actionResult = `Switched to ${switchTarget.name}!`;
					break;

				case 'item':
					return { success: false, message: 'Items not implemented yet!' };

				case 'flee':
					const winner = isPlayer1 ? 'opponent' : 'user';
					battle.endBattle(winner);
					actionResult = `${currentCharacter.name} fled from battle!`;
					this.endBattle(session.player1Id);
					this.endBattle(session.player2Id);
					return {
						success: true,
						message: actionResult,
						battleComplete: true
					};

				default:
					return { success: false, message: 'Invalid action!' };
			}

			// Mark that this player has acted
			session.playerActions.set(userId, true);
			battle.addToBattleLog(actionResult);

			// Check if both players have acted
			const bothPlayersActed = session.playerActions.get(session.player1Id) && session.playerActions.get(session.player2Id);
			
			if (bothPlayersActed) {
				// Process turn and reset action flags
				battle.nextTurn();
				session.currentTurn++;
				session.playerActions.set(session.player1Id, false);
				session.playerActions.set(session.player2Id, false);
			}

			// Check if battle is complete
			if (battle.isComplete()) {
				this.endBattle(session.player1Id);
				this.endBattle(session.player2Id);
				return {
					success: true,
					message: actionResult,
					battleComplete: true
				};
			}

			// Reset timeout count on successful action
			session.timeoutCount.set(userId, 0);
			session.lastActionTime = new Date();

			// Validate battle state after action
			const postActionValidation = battle.validateBattleState();
			if (!postActionValidation.valid) {
				console.error('Battle state corrupted after action:', postActionValidation.errors);
				// Don't return error to user, but log it
			}

			return { success: true, message: actionResult };
		} catch (error) {
			console.error('Error executing player action:', error);
			return { success: false, message: 'An error occurred during battle!' };
		}
	}


	public static endBattle(userId: string): boolean {
		const session = this.getBattle(userId);
		if (session) {
			// Remove battle for both players
			this.activeBattles.delete(session.player1Id);
			this.activeBattles.delete(session.player2Id);
			return true;
		}
		return false;
	}

	public static getActiveBattleCount(): number {
		return this.activeBattles.size;
	}

	public static getActiveBattleStats(): { totalBattles: number; activePlayers: number; averageTurn: number } {
		const sessions = new Set<BattleSession>();
		for (const session of this.activeBattles.values()) {
			sessions.add(session);
		}
		
		const totalBattles = sessions.size;
		const activePlayers = this.activeBattles.size;
		const averageTurn = totalBattles > 0 
			? Array.from(sessions).reduce((sum, session) => sum + session.currentTurn, 0) / totalBattles 
			: 0;
		
		return { totalBattles, activePlayers, averageTurn: Math.round(averageTurn) };
	}

	public static handleTimeout(userId: string): { forfeit: boolean; message: string } {
		const session = this.getBattle(userId);
		if (!session) {
			return { forfeit: false, message: 'Battle not found!' };
		}

		const currentTimeouts = session.timeoutCount.get(userId) || 0;
		const newTimeoutCount = currentTimeouts + 1;
		session.timeoutCount.set(userId, newTimeoutCount);
		session.lastActionTime = new Date();

		if (newTimeoutCount >= 3) {
			// Auto-forfeit after 3 timeouts
			const winner = userId === session.player1Id ? 'opponent' : 'user';
			session.battle.endBattle(winner);
			this.endBattle(userId);
			return { 
				forfeit: true, 
				message: `You have timed out 3 times and automatically forfeited the battle!` 
			};
		}

		// Force this player to take a "skip" action
		session.playerActions.set(userId, true);
		session.battle.addToBattleLog(`${userId === session.player1Id ? 'Player 1' : 'Player 2'} timed out!`);
		
		// Check if both players have now acted (one timed out, other may have acted)
		const bothPlayersActed = session.playerActions.get(session.player1Id) && session.playerActions.get(session.player2Id);
		
		if (bothPlayersActed) {
			session.battle.nextTurn();
			session.currentTurn++;
			session.playerActions.set(session.player1Id, false);
			session.playerActions.set(session.player2Id, false);
		}

		return { 
			forfeit: false, 
			message: `⏰ Turn timed out! (${newTimeoutCount}/3 timeouts)` 
		};
	}

	public static cleanupOldBattles(): void {
		const now = new Date();
		const maxAge = 30 * 60 * 1000; // 30 minutes
		const processedSessions = new Set<string>();

		for (const [, session] of this.activeBattles.entries()) {
			// Skip if we've already processed this session
			if (processedSessions.has(session.id)) {
				continue;
			}
			
			if (now.getTime() - session.createdAt.getTime() > maxAge) {
				// Clean up both players' entries for this session
				this.activeBattles.delete(session.player1Id);
				this.activeBattles.delete(session.player2Id);
				console.log(`Cleaned up expired battle: ${session.id}`);
			}
			
			processedSessions.add(session.id);
		}
	}

	// Run cleanup every 5 minutes
	static {
		setInterval(
			() => {
				this.cleanupOldBattles();
			},
			5 * 60 * 1000
		);
	}
}

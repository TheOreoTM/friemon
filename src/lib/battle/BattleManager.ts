import { Battle } from './Battle';
import { BattleInterface } from './BattleInterface';
import { Character } from '../character/Character';
import { AIEngine } from '../ai/AIEngine';
import { getTechniqueByName } from '../data/Techniques';
import { STARTER_CHARACTERS } from '../data/Characters';
import { AIMindset } from '../types/enums';

export interface BattleSession {
	id: string;
	battle: Battle;
	aiEngine?: AIEngine;
	interface: BattleInterface;
	userId: string;
	isAIBattle: boolean;
	createdAt: Date;
	timeoutCount: number;
	lastActionTime: Date;
}

export class BattleManager {
	private static activeBattles: Map<string, BattleSession> = new Map();

	public static createAIBattle(userId: string, aiDifficulty: AIMindset): BattleSession {
		// TODO: Fetch user's actual team from database
		const userTeam = Object.values(STARTER_CHARACTERS)
			.slice(0, 3)
			.map((data) => Character.fromData(data));

		// Create balanced AI team
		const aiTeam = Object.values(STARTER_CHARACTERS)
			.slice(3, 6)
			.map((data) => Character.fromData(data));

		const battle = new Battle(userTeam, aiTeam);
		const aiEngine = new AIEngine(aiDifficulty);
		const battleInterface = new BattleInterface(battle);

		const session: BattleSession = {
			id: `${userId}_${Date.now()}`,
			battle,
			aiEngine,
			interface: battleInterface,
			userId,
			isAIBattle: true,
			createdAt: new Date(),
			timeoutCount: 0,
			lastActionTime: new Date()
		};

		this.activeBattles.set(userId, session);
		return session;
	}

	public static createPlayerBattle(player1Id: string, player2Id: string): BattleSession {
		// TODO: Fetch both players' teams from database
		const player1Team = Object.values(STARTER_CHARACTERS)
			.slice(0, 3)
			.map((data) => Character.fromData(data));

		const player2Team = Object.values(STARTER_CHARACTERS)
			.slice(3, 6)
			.map((data) => Character.fromData(data));

		const battle = new Battle(player1Team, player2Team);
		const battleInterface = new BattleInterface(battle);

		const session: BattleSession = {
			id: `${player1Id}_vs_${player2Id}_${Date.now()}`,
			battle,
			interface: battleInterface,
			userId: player1Id, // Primary user (challenger)
			isAIBattle: false,
			createdAt: new Date(),
			timeoutCount: 0,
			lastActionTime: new Date()
		};

		this.activeBattles.set(player1Id, session);
		return session;
	}

	public static getBattle(userId: string): BattleSession | null {
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

		const { battle, aiEngine } = session;
		const currentCharacter = battle.getCurrentCharacter();

		if (!currentCharacter) {
			return { success: false, message: 'No active character!' };
		}

		let actionResult = '';

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

					const targetCharacter = battle.getOpponentCharacter();
					if (!targetCharacter) {
						return { success: false, message: 'No opponent character!' };
					}

					const success = battle.executeTechnique(currentCharacter, targetCharacter, technique);
					actionResult = success ? `${currentCharacter.name} used ${technique.name}!` : `${technique.name} failed!`;
					break;

				case 'switch':
					if (!target) {
						return { success: false, message: 'No character specified!' };
					}

					const switchTarget = battle.getUserCharacters().find((char) => char.name.toLowerCase() === target.toLowerCase());

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
					// TODO: Implement item usage
					return { success: false, message: 'Items not implemented yet!' };

				case 'flee':
					battle.endBattle('opponent'); // Opponent wins if player flees
					actionResult = 'You fled from battle!';
					this.activeBattles.delete(userId);
					return {
						success: true,
						message: actionResult,
						battleComplete: true
					};

				default:
					return { success: false, message: 'Invalid action!' };
			}

			// Add action to battle log
			battle.addToBattleLog(actionResult);

			// Process AI turn if it's an AI battle and battle is not complete
			if (session.isAIBattle && aiEngine && !battle.isComplete()) {
				await this.processAITurn(session);
			}

			// Check if battle is complete
			if (battle.isComplete()) {
				// TODO: Save battle results to database
				this.activeBattles.delete(userId);
				return {
					success: true,
					message: actionResult,
					battleComplete: true
				};
			}

			// Reset timeout count on successful action
			session.timeoutCount = 0;
			session.lastActionTime = new Date();

			// Advance turn
			battle.nextTurn();

			return { success: true, message: actionResult };
		} catch (error) {
			console.error('Error executing player action:', error);
			return { success: false, message: 'An error occurred during battle!' };
		}
	}

	private static async processAITurn(session: BattleSession): Promise<void> {
		const { battle, aiEngine } = session;

		if (!aiEngine || battle.isComplete()) {
			return;
		}

		try {
			// Get AI decision
			const decision = aiEngine.makeDecision(battle, false); // false = AI turn

			if (decision.type === 'technique') {
				const aiCharacter = battle.getCurrentCharacter();
				const target = battle.getOpponentCharacter();

				if (aiCharacter && target) {
					// Use technique index to get technique from character's technique list
					const techniqueName = aiCharacter.techniques[decision.data];
					const technique = getTechniqueByName(techniqueName);

					if (technique) {
						const success = battle.executeTechnique(aiCharacter, target, technique);
						const message = success ? `${aiCharacter.name} used ${technique.name}!` : `${technique.name} failed!`;
						battle.addToBattleLog(message);
					}
				}
			} else if (decision.type === 'switch') {
				const aiCharacters = battle.getAICharacters();
				const switchTarget = aiCharacters[decision.data];

				if (switchTarget && !switchTarget.isDefeated()) {
					battle.switchCharacterByObject(switchTarget);
					battle.addToBattleLog(`AI switched to ${switchTarget.name}!`);
				}
			}

			// Small delay to simulate AI thinking
			await new Promise((resolve) => setTimeout(resolve, 1000));
		} catch (error) {
			console.error('Error processing AI turn:', error);
		}
	}

	public static endBattle(userId: string): boolean {
		return this.activeBattles.delete(userId);
	}

	public static getActiveBattleCount(): number {
		return this.activeBattles.size;
	}

	public static handleTimeout(userId: string): { forfeit: boolean; message: string } {
		const session = this.getBattle(userId);
		if (!session) {
			return { forfeit: false, message: 'Battle not found!' };
		}

		session.timeoutCount++;
		session.lastActionTime = new Date();

		if (session.timeoutCount >= 3) {
			// Auto-forfeit after 3 timeouts
			session.battle.endBattle('opponent');
			this.activeBattles.delete(userId);
			return { 
				forfeit: true, 
				message: `You have timed out 3 times and automatically forfeited the battle!` 
			};
		}

		// Skip turn and advance to AI/opponent
		if (session.isAIBattle && session.aiEngine && !session.battle.isComplete()) {
			this.processAITurn(session);
		}
		
		session.battle.nextTurn();

		return { 
			forfeit: false, 
			message: `⏰ Turn timed out! (${session.timeoutCount}/3 timeouts)` 
		};
	}

	public static cleanupOldBattles(): void {
		const now = new Date();
		const maxAge = 30 * 60 * 1000; // 30 minutes

		for (const [id, session] of this.activeBattles.entries()) {
			if (now.getTime() - session.createdAt.getTime() > maxAge) {
				this.activeBattles.delete(id);
			}
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

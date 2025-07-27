import { Battle } from './Battle';
import { BattleInterface } from './BattleInterface';
import { Character } from '../character/Character';
import { STARTER_CHARACTERS } from '../data/Characters';
import { battleEvents } from './BattleEventEmitter';

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
	pendingActions: Map<string, { action: 'attack' | 'switch' | 'item' | 'flee'; target?: string }>;
	currentTurn: number;
	// Thread management
	player1ThreadId?: string;
	player2ThreadId?: string;
	battleLogThreadId?: string;
	player1ChannelId?: string;
	player2ChannelId?: string;
	battleLogChannelId?: string;
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
			pendingActions: new Map(),
			currentTurn: 1,
			// Thread IDs will be set when threads are created
			player1ThreadId: undefined,
			player2ThreadId: undefined,
			battleLogThreadId: undefined,
			player1ChannelId: undefined,
			player2ChannelId: undefined,
			battleLogChannelId: undefined
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

		// Validate battle state before processing action
		const validation = battle.validateBattleState();
		if (!validation.valid) {
			console.error('Invalid battle state:', validation.errors);
			return { success: false, message: 'Battle state is corrupted. Please contact support.' };
		}

		try {
			// Validate the action without executing it
			const validationResult = this.validatePlayerAction(session, userId, action, target);
			if (!validationResult.valid) {
				return { success: false, message: validationResult.message };
			}

			// Handle immediate forfeit
			if (action === 'flee') {
				const winner = isPlayer1 ? 'opponent' : 'user';
				battle.endBattle(winner);
				const actionResult = `${currentCharacter.name} fled from battle!`;
				battle.addToBattleLog(actionResult);
				this.endBattle(session.player1Id);
				this.endBattle(session.player2Id);
				return {
					success: true,
					message: actionResult,
					battleComplete: true
				};
			}

			// Store the action for later execution
			session.pendingActions.set(userId, { action, target });
			session.playerActions.set(userId, true);

			// Return success - turn processing will be handled by event system
			const playerName = isPlayer1 ? 'Player 1' : 'Player 2';
			return { 
				success: true, 
				message: `${playerName} has selected their action.` 
			};

		} catch (error) {
			console.error('Error executing player action:', error);
			return { success: false, message: 'An error occurred during battle!' };
		}
	}

	private static validatePlayerAction(
		session: BattleSession,
		userId: string,
		action: 'attack' | 'switch' | 'item' | 'flee',
		target?: string
	): { valid: boolean; message: string } {
		const { battle } = session;
		const isPlayer1 = userId === session.player1Id;
		const currentCharacter = isPlayer1 ? battle.state.userCharacter : battle.state.opponentCharacter;

		switch (action) {
			case 'attack':
				if (!target) {
					return { valid: false, message: 'No technique specified!' };
				}

				const technique = currentCharacter.getTechniqueByName(target);
				if (!technique) {
					return { valid: false, message: 'Character does not know this technique!' };
				}

				if (currentCharacter.currentMana < technique.manaCost) {
					return { valid: false, message: 'Not enough mana to use this technique!' };
				}

				break;

			case 'switch':
				if (!target) {
					return { valid: false, message: 'No character specified!' };
				}

				const party = isPlayer1 ? battle.state.userParty : battle.state.opponentParty;
				const switchTarget = party.find((char) => char.name.toLowerCase() === target.toLowerCase());

				if (!switchTarget) {
					return { valid: false, message: 'Character not found in team!' };
				}

				if (switchTarget.isDefeated()) {
					return { valid: false, message: 'Cannot switch to defeated character!' };
				}

				if (switchTarget === currentCharacter) {
					return { valid: false, message: 'Character is already active!' };
				}

				break;

			case 'item':
				return { valid: false, message: 'Items not implemented yet!' };

			case 'flee':
				// Flee is always valid
				break;

			default:
				return { valid: false, message: 'Invalid action!' };
		}

		return { valid: true, message: '' };
	}

	public static async processTurn(session: BattleSession): Promise<{ success: boolean; message: string; battleComplete?: boolean }> {
		const { battle } = session;
		
		// Check if both players have acted
		const bothPlayersActed = session.playerActions.get(session.player1Id) && session.playerActions.get(session.player2Id);
		
		if (!bothPlayersActed) {
			return { success: false, message: 'Not all players have acted yet' };
		}

		try {
			console.log(`Processing turn ${session.currentTurn} for battle ${session.id}`);
			
			// Execute both players' actions
			const results = await this.executeTurnActions(session);
			
			// Add turn results to battle log
			if (results) {
				battle.addToBattleLog(`Turn ${session.currentTurn} Results: ${results}`);
			}
			
			// Process turn end effects (status conditions, hazards, etc.)
			battle.nextTurn();
			
			// Increment session turn counter AFTER battle processes its turn
			session.currentTurn++;
			
			console.log(`Turn processed. New turn: ${session.currentTurn}, Battle turn: ${battle.state.turn}`);
			
			// Reset for next turn
			session.playerActions.set(session.player1Id, false);
			session.playerActions.set(session.player2Id, false);
			session.pendingActions.clear();

			// Check if battle is complete
			if (battle.isComplete()) {
				this.endBattle(session.player1Id);
				this.endBattle(session.player2Id);
				return {
					success: true,
					message: results || 'Battle complete!',
					battleComplete: true
				};
			}

			return { 
				success: true, 
				message: `Turn ${session.currentTurn - 1} complete! Starting turn ${session.currentTurn}.` 
			};
			
		} catch (error) {
			console.error('Error processing turn:', error);
			return { success: false, message: 'Error processing turn!' };
		}
	}

	private static async executeTurnActions(session: BattleSession): Promise<string> {
		const { battle } = session;
		const player1Action = session.pendingActions.get(session.player1Id);
		const player2Action = session.pendingActions.get(session.player2Id);

		// Create default "skip" actions for players who haven't acted (timeouts)
		const defaultAction = { action: 'skip' as const };
		const actions = [
			player1Action || defaultAction,
			player2Action || defaultAction
		];

		const results: string[] = [];

		// Only determine action order if both players have real actions
		if (actions[0].action !== 'skip' || actions[1].action !== 'skip') {
			// Determine action order based on speed/priority
			const actionOrder = this.determineActionOrder(session, actions[0], actions[1]);

			// Execute actions in order
			for (const { playerId, action } of actionOrder) {
				// Skip if the character is defeated or action is skip
				if (action.action === 'skip') {
					const playerName = playerId === session.player1Id ? 'Player 1' : 'Player 2';
					results.push(`${playerName} skipped their turn`);
					continue;
				}

				const isPlayer1 = playerId === session.player1Id;
				const character = isPlayer1 ? battle.state.userCharacter : battle.state.opponentCharacter;
				
				if (character.isDefeated()) {
					continue;
				}

				const result = this.executeAction(session, playerId, action);
				if (result) {
					results.push(result);
				}

				// Stop if battle is complete
				if (battle.isComplete()) {
					break;
				}
			}
		} else {
			results.push('Both players skipped their turn');
		}

		// If no results were generated, add a default message
		if (results.length === 0) {
			results.push('Both players acted, but no actions were processed.');
		}

		return results.join('\n');
	}

	private static determineActionOrder(
		session: BattleSession,
		player1Action: { action: string; target?: string },
		player2Action: { action: string; target?: string }
	): { playerId: string; action: { action: string; target?: string } }[] {
		const { battle } = session;
		
		// Switch actions always go first
		const player1IsSwitch = player1Action.action === 'switch';
		const player2IsSwitch = player2Action.action === 'switch';

		if (player1IsSwitch && !player2IsSwitch) {
			return [
				{ playerId: session.player1Id, action: player1Action },
				{ playerId: session.player2Id, action: player2Action }
			];
		}

		if (player2IsSwitch && !player1IsSwitch) {
			return [
				{ playerId: session.player2Id, action: player2Action },
				{ playerId: session.player1Id, action: player1Action }
			];
		}

		// If both switch or both attack, determine by speed
		const player1Speed = battle.state.userCharacter.getEffectiveStats().speed;
		const player2Speed = battle.state.opponentCharacter.getEffectiveStats().speed;

		if (player1Speed >= player2Speed) {
			return [
				{ playerId: session.player1Id, action: player1Action },
				{ playerId: session.player2Id, action: player2Action }
			];
		} else {
			return [
				{ playerId: session.player2Id, action: player2Action },
				{ playerId: session.player1Id, action: player1Action }
			];
		}
	}

	private static executeAction(
		session: BattleSession,
		playerId: string,
		action: { action: string; target?: string }
	): string | null {
		const { battle } = session;
		const isPlayer1 = playerId === session.player1Id;
		const currentCharacter = isPlayer1 ? battle.state.userCharacter : battle.state.opponentCharacter;

		// Skip if character is defeated
		if (currentCharacter.isDefeated()) {
			return null;
		}

		switch (action.action) {
			case 'skip':
				return null; // Skip actions are handled elsewhere
			case 'attack':
				if (!action.target) return null;
				
				const technique = currentCharacter.getTechniqueByName(action.target);
				if (!technique) return null;

				const targetCharacter = isPlayer1 ? battle.state.opponentCharacter : battle.state.userCharacter;
				if (!targetCharacter || targetCharacter.isDefeated()) return null;

				const techniqueSuccess = battle.executeTechnique(currentCharacter, targetCharacter, technique);
				return techniqueSuccess ? `${currentCharacter.name} used ${technique.name}!` : `${technique.name} failed!`;

			case 'switch':
				if (!action.target) return null;
				
				const party = isPlayer1 ? battle.state.userParty : battle.state.opponentParty;
				const switchTarget = party.find((char) => char.name.toLowerCase() === action.target!.toLowerCase());

				if (!switchTarget || switchTarget.isDefeated() || switchTarget === currentCharacter) {
					return null;
				}

				const switchIndex = party.findIndex((char) => char === switchTarget);
				const switchSuccess = battle.switchCharacter(isPlayer1, switchIndex);
				return switchSuccess ? `Switched to ${switchTarget.name}!` : null;

			default:
				return null;
		}
	}

	public static async createBattleThreads(
		session: BattleSession,
		guild: any,
		categoryId?: string
	): Promise<{ success: boolean; message: string; threads?: { player1: string; player2: string; battleLog: string } }> {
		if (!session) {
			return { success: false, message: 'Battle session not found!' };
		}

		try {
			const battleId = session.id.split('_')[0]; // Use first part of session ID
			
			// First, we need to find or create a text channel to create threads from
			// For now, let's create regular text channels instead of threads for simplicity
			
			// Create private channels for each player
			const player1Thread = await guild.channels.create({
				name: `🎯-battle-${battleId}-player-1-moves`,
				type: 0, // GUILD_TEXT
				parent: categoryId,
				reason: `Private move selection for Player 1 in battle ${battleId}`,
				permissionOverwrites: [
					{
						id: guild.id,
						deny: ['ViewChannel']
					},
					{
						id: session.player1Id,
						allow: ['ViewChannel', 'SendMessages']
					}
				]
			});

			const player2Thread = await guild.channels.create({
				name: `🎯-battle-${battleId}-player-2-moves`,
				type: 0, // GUILD_TEXT
				parent: categoryId,
				reason: `Private move selection for Player 2 in battle ${battleId}`,
				permissionOverwrites: [
					{
						id: guild.id,
						deny: ['ViewChannel']
					},
					{
						id: session.player2Id,
						allow: ['ViewChannel', 'SendMessages']
					}
				]
			});

			// Create public channel for battle log
			const battleLogThread = await guild.channels.create({
				name: `⚔️-battle-${battleId}-live-battle`,
				type: 0, // GUILD_TEXT
				parent: categoryId,
				reason: `Public battle log for battle ${battleId}`
			});

			// Update session with channel IDs
			session.player1ThreadId = player1Thread.id;
			session.player2ThreadId = player2Thread.id;
			session.battleLogThreadId = battleLogThread.id;
			session.player1ChannelId = player1Thread.id;
			session.player2ChannelId = player2Thread.id;
			session.battleLogChannelId = battleLogThread.id;

			// Emit event that channels have been created
			battleEvents.emitChannelsCreated(session, guild);

			return {
				success: true,
				message: 'Battle channels created successfully!',
				threads: {
					player1: player1Thread.id,
					player2: player2Thread.id,
					battleLog: battleLogThread.id
				}
			};
		} catch (error) {
			console.error('Error creating battle threads:', error);
			return { success: false, message: 'Failed to create battle threads' };
		}
	}

	public static async cleanupBattleChannels(sessionId: string, guild: any): Promise<void> {
		const session = this.getBattle(sessionId);
		if (!session) return;

		try {
			// Delete channels
			if (session.player1ThreadId) {
				const channel1 = guild.channels.cache.get(session.player1ThreadId);
				if (channel1) await channel1.delete('Battle completed');
			}
			if (session.player2ThreadId) {
				const channel2 = guild.channels.cache.get(session.player2ThreadId);
				if (channel2) await channel2.delete('Battle completed');
			}
			if (session.battleLogThreadId) {
				const logChannel = guild.channels.cache.get(session.battleLogThreadId);
				if (logChannel) await logChannel.delete('Battle completed');
			}
		} catch (error) {
			console.error('Error cleaning up battle channels:', error);
		}
	}

	// Thread/channel updating methods removed - now handled by BattleListener


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

	public static async handleTimeout(userId: string): Promise<{ forfeit: boolean; message: string }> {
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
		// Don't set a pending action for timeout - it will be skipped
		
		// Add timeout message to battle log
		session.battle.addToBattleLog(`${userId === session.player1Id ? 'Player 1' : 'Player 2'} timed out and skipped their turn!`);
		
		// Check if both players have now acted (one timed out, other may have acted)
		const bothPlayersActed = session.playerActions.get(session.player1Id) && session.playerActions.get(session.player2Id);
		
		if (bothPlayersActed) {
			// Process the turn (this will handle action execution and turn advancement)
			const turnResult = await this.processTurn(session);
			if (!turnResult.success) {
				console.error('Failed to process turn after timeout:', turnResult.message);
			}
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

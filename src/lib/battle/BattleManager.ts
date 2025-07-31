import { Battle } from './Battle';
import { BattleInterface } from './BattleInterface';
import { Character } from '../character/Character';
import { CharacterRegistry } from '../characters/CharacterRegistry';
import { battleEvents } from './BattleEventEmitter';
import { BattleActionType, PlayerAction, ActionExecutionResult } from '../types/interfaces';
import { BattleMessageCache, MessageTarget } from './BattleMessageCache';
import { AmbientMagicCondition, TerrainType } from '../types/enums';
import { ChannelType, type Guild, type Client } from 'discord.js';
import { GAME_CHANNEL_ID, BATTLE_CONSTANTS } from '../util/constants';

export interface BattleSession {
	id: string;
	battle: Battle;
	interface: BattleInterface;
	player1Id: string;
	player2Id: string;
	player1DisplayName: string;
	player2DisplayName: string;
	createdAt: Date;
	timeoutCount: Map<string, number>;
	lastActionTime: Date;
	playerActions: Map<string, boolean>;
	pendingActions: Map<string, PlayerAction>;
	currentTurn: number;
	player1ThreadId?: string;
	player2ThreadId?: string;
	battleLogThreadId?: string;
}

export class BattleManager {
	private static activeBattles: Map<string, BattleSession> = new Map();

	public static async createPlayerBattle(player1Id: string, player2Id: string, guild: Guild): Promise<BattleSession> {
		// Validate player IDs
		if (!player1Id || !player2Id || player1Id === player2Id) {
			throw new Error('Invalid player IDs for battle creation');
		}

		// Check if either player already has a battle
		if (this.getBattle(player1Id) || this.getBattle(player2Id)) {
			throw new Error('One or both players are already in a battle');
		}

		// Fetch player display names - required for battle creation
		const player1Member = await guild.members.fetch(player1Id);
		const player2Member = await guild.members.fetch(player2Id);
		const player1DisplayName = player1Member.displayName;
		const player2DisplayName = player2Member.displayName;

		// TODO: Fetch both players' teams from database
		// For now, use new character system to create random teams
		const availableCharacters = CharacterRegistry.getStarterCharacters();

		if (availableCharacters.length < 2) {
			throw new Error('Not enough characters available for battle. Need at least 2 starter characters.');
		}

		// Create teams using random starter characters
		const shuffledChars = [...availableCharacters].sort(() => Math.random() - 0.5);
		const player1Team: Character[] = [shuffledChars[0].createCharacter()];
		const player2Team: Character[] = [shuffledChars[1].createCharacter()];

		try {
			const battle = new Battle(player1Team, player2Team, AmbientMagicCondition.None, TerrainType.Normal, player1DisplayName, player2DisplayName);
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
				player1DisplayName,
				player2DisplayName,
				createdAt: new Date(),
				timeoutCount: new Map([
					[player1Id, 0],
					[player2Id, 0]
				]),
				lastActionTime: new Date(),
				playerActions: new Map([
					[player1Id, false],
					[player2Id, false]
				]),
				pendingActions: new Map(),
				currentTurn: 1,
				// Thread IDs will be set when threads are created
				player1ThreadId: undefined,
				player2ThreadId: undefined,
				battleLogThreadId: undefined
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

	public static getSessionById(sessionId: string): BattleSession | null {
		// Find session by ID across all active battles
		for (const session of this.activeBattles.values()) {
			if (session.id === sessionId) {
				return session;
			}
		}
		return null;
	}

	public static getBattleById(battleId: string): BattleSession | null {
		return this.activeBattles.get(battleId) || null;
	}

	public static async executePlayerAction(userId: string, action: BattleActionType, target?: string): Promise<ActionExecutionResult> {
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
			const playerName = isPlayer1 ? session.player1DisplayName : session.player2DisplayName;
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
		action: BattleActionType,
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

	public static async processTurn(session: BattleSession): Promise<ActionExecutionResult> {
		const { battle } = session;

		// Check if both players have acted
		const bothPlayersActed = session.playerActions.get(session.player1Id) && session.playerActions.get(session.player2Id);

		if (!bothPlayersActed) {
			return { success: false, message: 'Not all players have acted yet' };
		}

		try {
			console.log(`Processing turn ${session.currentTurn} for battle ${session.id}`);

			// Log turn action phase
			battle.addToBattleLog(`=== Turn ${session.currentTurn} Action Phase ===`);

			// Execute both players' actions (this will log to battle internally)
			await this.executeTurnActions(session);

			// Process turn end effects and move to next turn
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
					message: 'Battle complete!',
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

	private static async executeTurnActions(session: BattleSession): Promise<void> {
		const { battle } = session;
		const player1Action = session.pendingActions.get(session.player1Id);
		const player2Action = session.pendingActions.get(session.player2Id);

		// Create default "skip" actions for players who haven't acted (timeouts)
		const defaultAction = { action: 'skip' as const };
		const actions = [player1Action || defaultAction, player2Action || defaultAction];

		// Only determine action order if both players have real actions
		if (actions[0].action !== 'skip' || actions[1].action !== 'skip') {
			// Determine action order based on speed/priority
			const actionOrder = this.determineActionOrder(session, actions[0], actions[1]);

			// Execute actions in order
			for (const { playerId, action } of actionOrder) {
				// Skip if the character is defeated or action is skip
				if (action.action === 'skip') {
					const playerName = playerId === session.player1Id ? session.player1DisplayName : session.player2DisplayName;
					const character = playerId === session.player1Id ? battle.state.userCharacter : battle.state.opponentCharacter;
					const skipMessage = `${character.name} (${playerName}) skipped their turn`;
					this.sendActionMessage(session, skipMessage);
					continue;
				}

				const isPlayer1 = playerId === session.player1Id;
				const character = isPlayer1 ? battle.state.userCharacter : battle.state.opponentCharacter;

				if (character.isDefeated()) {
					continue;
				}

				// Execute the action - this will log everything internally via the Battle class
				this.executeAction(session, playerId, action);

				// Stop if battle is complete
				if (battle.isComplete()) {
					break;
				}
			}
		} else {
			this.sendActionMessage(session, 'Both players skipped their turn');
		}
	}

	private static determineActionOrder(
		session: BattleSession,
		player1Action: PlayerAction,
		player2Action: PlayerAction
	): { playerId: string; action: PlayerAction }[] {
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

	/**
	 * Sends an individual action message to the battle log channel
	 */
	private static async sendActionMessage(session: BattleSession, message: string): Promise<void> {
		try {
			// Try to send directly to the battle log channel using the cached client
			if (session.battleLogThreadId && BattleManager.clientInstance) {
				const channel = await BattleManager.clientInstance.channels.fetch(session.battleLogThreadId);
				if (channel && channel.isTextBased() && 'send' in channel) {
					await channel.send(message);
					return;
				}
			}
		} catch (error) {
			console.error('Error sending action message directly:', error);
		}
		
		// Fallback to event system
		battleEvents.emitActionMessage(session.id, message);
	}

	// Store client instance for direct channel access
	private static clientInstance: Client;

	public static setClient(client: Client): void {
		this.clientInstance = client;
	}

	/**
	 * Default technique execution for techniques without custom onUsed function
	 */
	private static executeDefaultTechnique(
		attacker: Character, 
		target: Character, 
		technique: any, 
		session: BattleSession, 
		messageCache: BattleMessageCache, 
		_isPlayer1: boolean
	): void {
		const attackerName = session.interface.formatCharacterWithPlayer(attacker, session);
		const targetName = session.interface.formatCharacterWithPlayer(target, session);

		// Basic technique use message
		messageCache.pushTechniqueUse(attackerName, technique.name, targetName);

		// Consume mana
		if (technique.manaCost > 0) {
			attacker.consumeMana(technique.manaCost);
			messageCache.pushManaChange(attackerName, -technique.manaCost, attacker.currentMana);
		}

		// Handle different technique types
		if (technique.category === 'Support' && technique.name.toLowerCase().includes('heal')) {
			// Healing technique
			const healingPower = Math.floor(attacker.getEffectiveStats().magicAttack * 0.6);
			const actualHealing = Math.min(healingPower, target.maxHP - target.currentHP);
			
			if (actualHealing > 0) {
				target.currentHP += actualHealing;
				messageCache.pushHealing(targetName, actualHealing, target.currentHP);
			} else {
				messageCache.push(`${targetName} is already at full health!`);
			}
		} else if (technique.power > 0) {
			// Damage technique
			const stats = attacker.getEffectiveStats();
			const targetStats = target.getEffectiveStats();
			
			let damage: number;
			if (technique.affinity && technique.affinity.includes('Physical')) {
				damage = Math.max(1, Math.floor(stats.attack - targetStats.defense));
			} else {
				damage = Math.max(1, Math.floor(stats.magicAttack - targetStats.magicDefense));
			}

			// Apply technique power scaling
			damage = Math.floor(damage * (technique.power / 100));
			
			// Apply random variance
			damage = Math.floor(damage * (0.9 + Math.random() * 0.2));

			if (damage > 0) {
				const oldHP = target.currentHP;
				target.takeDamage(damage);
				messageCache.pushDamage(attackerName, targetName, damage, target.currentHP);

				// Check for defeat
				if (target.currentHP <= 0 && oldHP > 0) {
					messageCache.push(`💀 **${targetName} is defeated!**`);
				}
			} else {
				messageCache.push(`${targetName} takes no damage!`);
			}
		} else {
			// Support technique with no damage
			messageCache.push(`✨ **${technique.name} takes effect!**`);
		}
	}

	private static executeAction(session: BattleSession, playerId: string, action: PlayerAction): void {
		const { battle } = session;
		const isPlayer1 = playerId === session.player1Id;
		const currentCharacter = isPlayer1 ? battle.state.userCharacter : battle.state.opponentCharacter;

		// Skip if character is defeated
		if (currentCharacter.isDefeated()) {
			return;
		}

		switch (action.action) {
			case 'skip':
				return; // Skip actions are handled elsewhere
			case 'attack':
				if (!action.target) return;

				const technique = currentCharacter.getTechniqueByName(action.target);
				if (!technique) return;

				const targetCharacter = isPlayer1 ? battle.state.opponentCharacter : battle.state.userCharacter;
				if (!targetCharacter || targetCharacter.isDefeated()) return;

				// Create message cache for this action
				const messageCache = new BattleMessageCache(session);

				// Execute technique using embedded action function
				if (technique.onUsed) {
					// Use custom technique action
					technique.onUsed({
						user: currentCharacter,
						target: targetCharacter,
						session,
						messageCache,
						isPlayer1User: isPlayer1,
						userTeam: isPlayer1 ? battle.getUserCharacters() : battle.getOpponentCharacters(),
						opponentTeam: isPlayer1 ? battle.getOpponentCharacters() : battle.getUserCharacters()
					});
				} else {
					// Fallback to default technique execution
					this.executeDefaultTechnique(currentCharacter, targetCharacter, technique, session, messageCache, isPlayer1);
				}

				// Send all cached messages
				const messages = messageCache.flush();
				for (const message of messages) {
					if (message.target === MessageTarget.BattleLog || message.target === MessageTarget.All) {
						this.sendActionMessage(session, message.content);
					}
					// TODO: Handle other message targets (player threads) if needed
				}
				break;

			case 'switch':
				if (!action.target) return;

				const party = isPlayer1 ? battle.state.userParty : battle.state.opponentParty;
				const switchTarget = party.find((char) => char.name.toLowerCase() === action.target!.toLowerCase());

				if (!switchTarget || switchTarget.isDefeated() || switchTarget === currentCharacter) {
					return;
				}

				const switchIndex = party.findIndex((char) => char === switchTarget);
				
				// Generate switch message
				const playerDisplayName = isPlayer1 ? session.player1DisplayName : session.player2DisplayName;
				const switchMessage = `${playerDisplayName} switches to ${switchTarget.name}!`;
				this.sendActionMessage(session, switchMessage);

				// Switch character
				battle.switchCharacter(isPlayer1, switchIndex);
				break;

			default:
				return;
		}
	}

	public static async createBattleThreads(
		session: BattleSession,
		guild: Guild
	): Promise<{ success: boolean; message: string; threads?: { player1: string; player2: string; battleLog: string } }> {
		if (!session) {
			return { success: false, message: 'Battle session not found!' };
		}

		try {
			const battleId = session.id.split('_')[0]; // Use first part of session ID

			// Find a suitable parent channel for creating threads
			// Look for a general channel or use the first text channel
			let parentChannel = guild.channels.cache.get(GAME_CHANNEL_ID);
			if (!parentChannel) {
				throw new Error('No suitable parent channel found for creating threads');
			}

			if (parentChannel.type !== ChannelType.GuildText) {
				throw new Error('Parent channel must be a text channel');
			}

			const player1 = guild.members.cache.get(session.player1Id);
			if (!player1) {
				throw new Error('Player 1 not found in guild');
			}

			const player2 = guild.members.cache.get(session.player2Id);
			if (!player2) {
				throw new Error('Player 2 not found in guild');
			}

			// Create private thread for Player 1
			const player1Thread = await parentChannel.threads!.create({
				name: `🎯 Battle ${battleId} - ${player1.user.username} Moves`,
				autoArchiveDuration: BATTLE_CONSTANTS.THREAD_AUTO_ARCHIVE_DURATION,
				type: ChannelType.PrivateThread,
				reason: `Private move selection for Player 1 in battle ${battleId}`,
				invitable: false
			});

			// Add Player 1 to their private thread
			await player1Thread.members.add(session.player1Id);

			// Create private thread for Player 2
			const player2Thread = await parentChannel.threads!.create({
				name: `🎯 Battle ${battleId} - ${player2.user.username} Moves`,
				autoArchiveDuration: BATTLE_CONSTANTS.THREAD_AUTO_ARCHIVE_DURATION,
				type: ChannelType.PrivateThread,
				reason: `Private move selection for Player 2 in battle ${battleId}`,
				invitable: false
			});

			// Add Player 2 to their private thread
			await player2Thread.members.add(session.player2Id);

			// Create public thread for battle log
			const battleLogThread = await parentChannel.threads!.create({
				name: `⚔️ ${player1.user.username} vs ${player2.user.username}`,
				autoArchiveDuration: BATTLE_CONSTANTS.THREAD_AUTO_ARCHIVE_DURATION,
				type: ChannelType.PrivateThread,
				reason: `Public battle log for battle ${battleId}`
			});

			// Add both players to the public main thread
			await battleLogThread.members.add(session.player1Id);
			await battleLogThread.members.add(session.player2Id);

			// Update session with thread IDs
			session.player1ThreadId = player1Thread.id;
			session.player2ThreadId = player2Thread.id;
			session.battleLogThreadId = battleLogThread.id;

			// Emit event that threads have been created
			battleEvents.emitChannelsCreated(session, guild);

			return {
				success: true,
				message: 'Battle threads created successfully!',
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

	public static async cleanupBattleThreads(sessionId: string, guild: Guild): Promise<void> {
		const session = this.getBattle(sessionId);
		if (!session) return;

		try {
			// Archive and lock threads instead of deleting them
			// This preserves battle history while preventing further interaction

			if (session.player1ThreadId) {
				const thread1 = guild.channels.cache.get(session.player1ThreadId);
				if (thread1 && thread1.isThread()) {
					await thread1.setArchived(true, 'Battle completed');
					await thread1.setLocked(true);
				}
			}

			if (session.player2ThreadId) {
				const thread2 = guild.channels.cache.get(session.player2ThreadId);
				if (thread2 && thread2.isThread()) {
					await thread2.setArchived(true, 'Battle completed');
					await thread2.setLocked(true);
				}
			}

			if (session.battleLogThreadId) {
				const logThread = guild.channels.cache.get(session.battleLogThreadId);
				if (logThread && logThread.isThread()) {
					// Keep the main battle log accessible but locked
					await logThread.setLocked(true);
					// Archive after 24 hours to let people review the battle
					setTimeout(
						async () => {
							try {
								await logThread.setArchived(true, 'Battle review period ended');
							} catch (error) {
								console.error('Error archiving battle log thread:', error);
							}
						},
						BATTLE_CONSTANTS.BATTLE_CLEANUP_DELAY
					); // 24 hours
				}
			}
		} catch (error) {
			console.error('Error cleaning up battle threads:', error);
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
		const averageTurn = totalBattles > 0 ? Array.from(sessions).reduce((sum, session) => sum + session.currentTurn, 0) / totalBattles : 0;

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

		if (newTimeoutCount >= BATTLE_CONSTANTS.MAX_TIMEOUTS) {
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
		session.battle.addToBattleLog(`${userId === session.player1Id ? session.player1DisplayName : session.player2DisplayName} timed out and skipped their turn!`);

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
		const maxAge = BATTLE_CONSTANTS.OLD_BATTLE_MAX_AGE;
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
			BATTLE_CONSTANTS.CLEANUP_INTERVAL
		);
	}
}

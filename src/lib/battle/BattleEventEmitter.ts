import { EventEmitter } from 'events';
import { BattleSession } from './BattleManager';
import { Guild, StringSelectMenuInteraction } from 'discord.js';

export interface BattleEvents {
	'battle:created': (session: BattleSession, guild: Guild) => void;
	'battle:move-selected': (userId: string, interaction: StringSelectMenuInteraction) => void;
	'battle:turn-complete': (session: BattleSession, guild: Guild) => void;
	'battle:completed': (session: BattleSession, guild: Guild) => void;
	'battle:player-timeout': (userId: string, session: BattleSession) => void;
	'battle:channels-created': (session: BattleSession, guild: Guild) => void;
}

export class BattleEventEmitter extends EventEmitter {
	private static instance: BattleEventEmitter;

	private constructor() {
		super();
		this.setMaxListeners(50); // Allow many listeners for different battle sessions
	}

	public static getInstance(): BattleEventEmitter {
		if (!BattleEventEmitter.instance) {
			BattleEventEmitter.instance = new BattleEventEmitter();
		}
		return BattleEventEmitter.instance;
	}

	// Type-safe event emission methods
	public emitBattleCreated(session: BattleSession, guild: Guild): void {
		this.emit('battle:created', session, guild);
	}

	public emitMoveSelected(userId: string, interaction: StringSelectMenuInteraction): void {
		this.emit('battle:move-selected', userId, interaction);
	}

	public emitTurnComplete(session: BattleSession, guild: Guild): void {
		this.emit('battle:turn-complete', session, guild);
	}

	public emitBattleCompleted(session: BattleSession, guild: Guild): void {
		this.emit('battle:completed', session, guild);
	}

	public emitPlayerTimeout(userId: string, session: BattleSession): void {
		this.emit('battle:player-timeout', userId, session);
	}

	public emitChannelsCreated(session: BattleSession, guild: Guild): void {
		this.emit('battle:channels-created', session, guild);
	}

	// Type-safe event listener methods
	public onBattleCreated(listener: (session: BattleSession, guild: Guild) => void): void {
		this.on('battle:created', listener);
	}

	public onMoveSelected(listener: (userId: string, interaction: StringSelectMenuInteraction) => void): void {
		this.on('battle:move-selected', listener);
	}

	public onTurnComplete(listener: (session: BattleSession, guild: Guild) => void): void {
		this.on('battle:turn-complete', listener);
	}

	public onBattleCompleted(listener: (session: BattleSession, guild: Guild) => void): void {
		this.on('battle:completed', listener);
	}

	public onPlayerTimeout(listener: (userId: string, session: BattleSession) => void): void {
		this.on('battle:player-timeout', listener);
	}

	public onChannelsCreated(listener: (session: BattleSession, guild: Guild) => void): void {
		this.on('battle:channels-created', listener);
	}
}

// Export singleton instance
export const battleEvents = BattleEventEmitter.getInstance();
import { Client } from 'discord.js';
import { DiscordInteractionListener } from './listeners/DiscordInteractionListener';
import { BattleActionListener } from './listeners/BattleActionListener';
import { ChannelUpdateListener } from './listeners/ChannelUpdateListener';
import { BattleManager } from './BattleManager';

export class BattleSystemManager {
	private static instance: BattleSystemManager;
	private isInitialized = false;

	private constructor() {
		// Private constructor for singleton
	}

	public static getInstance(): BattleSystemManager {
		if (!BattleSystemManager.instance) {
			BattleSystemManager.instance = new BattleSystemManager();
		}
		return BattleSystemManager.instance;
	}

	public initialize(client: Client): void {
		if (this.isInitialized) {
			console.warn('BattleSystemManager is already initialized');
			return;
		}

		console.log('Initializing Battle System Manager...');

		// Set client instance for BattleManager
		BattleManager.setClient(client);

		// Initialize all listeners - we don't need to store references since they set up their own event handlers
		new DiscordInteractionListener(client);
		new BattleActionListener();
		new ChannelUpdateListener(client);

		this.isInitialized = true;
		console.log('Battle System Manager initialized successfully');
	}

	public isReady(): boolean {
		return this.isInitialized;
	}
}

// Export singleton instance
export const battleSystem = BattleSystemManager.getInstance();
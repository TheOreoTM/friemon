import { Client } from 'discord.js';
import { DiscordInteractionListener } from './listeners/DiscordInteractionListener';
import { container } from '@sapphire/framework';

export class BattleSystemManager {
	private static instance: BattleSystemManager;
	private isInitialized = false;

	private constructor() {}

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

		// Only need one listener now!
		new DiscordInteractionListener(client);

		this.isInitialized = true;
		container.logger.info('Battle System Manager initialized successfully');
	}

	public isReady(): boolean {
		return this.isInitialized;
	}
}

export const battleSystem = BattleSystemManager.getInstance();

import { CharacterRegistry } from '../characters/CharacterRegistry';
import { getCharacterTier } from '../data/Characters';
import { EmbedBuilder, TextChannel } from 'discord.js';

interface ChannelSpawnData {
	messageCount: number;
	lastSpawnTime: number;
	spawnsToday: number;
	lastSpawnDate: string;
}

export class CharacterSpawningService {
	private static instance: CharacterSpawningService;
	private channelData = new Map<string, ChannelSpawnData>();
	
	// Configuration
	private readonly MESSAGES_PER_SPAWN = 50; // Characters spawn every X messages
	private readonly SPAWN_COOLDOWN = 300000; // 5 minutes cooldown between spawns
	private readonly MAX_SPAWNS_PER_DAY = 200; // Maximum spawns per channel per day
	private readonly SPAWN_CHANCE = 0.7; // 70% chance to spawn when conditions are met

	public static getInstance(): CharacterSpawningService {
		if (!CharacterSpawningService.instance) {
			CharacterSpawningService.instance = new CharacterSpawningService();
		}
		return CharacterSpawningService.instance;
	}

	private constructor() {}

	public async handleMessage(channelId: string, channel: TextChannel): Promise<void> {
		// Initialize or get channel data
		const data = this.getChannelData(channelId);
		
		// Increment message count
		data.messageCount++;
		
		// Check if spawning conditions are met
		if (this.shouldSpawn(data)) {
			await this.spawnCharacter(channel);
			this.resetSpawnData(data);
		}

		// Update channel data
		this.channelData.set(channelId, data);
	}

	private getChannelData(channelId: string): ChannelSpawnData {
		const today = new Date().toDateString();
		let data = this.channelData.get(channelId);

		if (!data) {
			data = {
				messageCount: 0,
				lastSpawnTime: 0,
				spawnsToday: 0,
				lastSpawnDate: today
			};
		}

		// Reset daily spawn count if it's a new day
		if (data.lastSpawnDate !== today) {
			data.spawnsToday = 0;
			data.lastSpawnDate = today;
		}

		return data;
	}

	private shouldSpawn(data: ChannelSpawnData): boolean {
		const now = Date.now();
		
		// Check message count threshold
		if (data.messageCount < this.MESSAGES_PER_SPAWN) {
			return false;
		}

		// Check cooldown
		if (now - data.lastSpawnTime < this.SPAWN_COOLDOWN) {
			return false;
		}

		// Check daily limit
		if (data.spawnsToday >= this.MAX_SPAWNS_PER_DAY) {
			return false;
		}

		// Check random chance
		if (Math.random() > this.SPAWN_CHANCE) {
			return false;
		}

		return true;
	}

	private async spawnCharacter(channel: TextChannel): Promise<void> {
		try {
			// Get random character with weighted rarity
			const character = this.getRandomCharacter();
			if (!character) return;

			const displayInfo = character.getDisplayInfo();
			const tier = getCharacterTier(displayInfo.name);

			// Create spawn embed
			const embed = new EmbedBuilder()
				.setTitle('✨ A wild character appeared!')
				.setColor(this.getTierColor(tier))
				.setDescription(`${displayInfo.emoji} **${displayInfo.name}** has appeared in the channel!`)
				.addFields(
					{
						name: '📊 Character Info',
						value: [
							`**Level:** ${displayInfo.level}`,
							`**Races:** ${displayInfo.races.join(', ')}`,
							`**Tier:** ${tier}`,
							`**Total Stats:** ${displayInfo.statTotal}`
						].join('\n'),
						inline: true
					},
					{
						name: '🎯 Ability',
						value: `**${displayInfo.ability}**\n${displayInfo.abilityDescription.slice(0, 100)}${displayInfo.abilityDescription.length > 100 ? '...' : ''}`,
						inline: true
					}
				)
				.setFooter({ text: 'Use character capture commands to add this character to your collection!' })
				.setTimestamp();

			await channel.send({ embeds: [embed] });

			// TODO: Store the spawned character in a temporary collection for capture
			// This would require implementing a capture mechanism

		} catch (error) {
			console.error('Error spawning character:', error);
		}
	}

	private getRandomCharacter() {
		const characters = CharacterRegistry.getAllCharacters();
		if (characters.length === 0) return null;

		// Weighted selection based on character level/tier
		const weights = characters.map(char => {
			const displayInfo = char.getDisplayInfo();
			const tier = getCharacterTier(displayInfo.name);
			
			// Lower level characters have higher spawn weights
			switch (tier) {
				case 'Common': return 50;
				case 'Uncommon': return 30;
				case 'Rare': return 15;
				case 'Epic': return 4;
				case 'Legendary': return 1;
				default: return 25;
			}
		});

		const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
		let random = Math.random() * totalWeight;

		for (let i = 0; i < characters.length; i++) {
			random -= weights[i];
			if (random <= 0) {
				return characters[i];
			}
		}

		// Fallback
		return characters[Math.floor(Math.random() * characters.length)];
	}

	private getTierColor(tier: string): number {
		switch (tier) {
			case 'Common': return 0x95a5a6;
			case 'Uncommon': return 0x27ae60;
			case 'Rare': return 0x3498db;
			case 'Epic': return 0x9b59b6;
			case 'Legendary': return 0xf39c12;
			default: return 0x95a5a6;
		}
	}

	private resetSpawnData(data: ChannelSpawnData): void {
		data.messageCount = 0;
		data.lastSpawnTime = Date.now();
		data.spawnsToday++;
	}

	// Admin methods for debugging/configuration
	public getChannelStats(channelId: string): ChannelSpawnData | null {
		return this.channelData.get(channelId) || null;
	}

	public resetChannelData(channelId: string): void {
		this.channelData.delete(channelId);
	}

	public setSpawnConfig(config: Partial<{
		messagesPerSpawn: number;
		spawnCooldown: number;
		maxSpawnsPerDay: number;
		spawnChance: number;
	}>): void {
		if (config.messagesPerSpawn) (this as any).MESSAGES_PER_SPAWN = config.messagesPerSpawn;
		if (config.spawnCooldown) (this as any).SPAWN_COOLDOWN = config.spawnCooldown;
		if (config.maxSpawnsPerDay) (this as any).MAX_SPAWNS_PER_DAY = config.maxSpawnsPerDay;
		if (config.spawnChance) (this as any).SPAWN_CHANCE = config.spawnChance;
	}
}
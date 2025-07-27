import { ButtonInteraction, Message, ComponentType, InteractionCollector, EmbedBuilder } from 'discord.js';
import { BattleManager } from './BattleManager';

export class BattleCollector {
	private static activeCollectors: Map<string, InteractionCollector<any>> = new Map();
	private static readonly TURN_TIMEOUT = 2 * 60 * 1000; // 2 minutes

	public static createCollector(message: Message, userId: string): void {
		// Clean up any existing collector
		this.stopCollector(userId);

		const collector = message.createMessageComponentCollector({
			componentType: ComponentType.Button,
			filter: (interaction) => {
				const session = BattleManager.getBattle(userId);
				if (!session) return false;
				// Allow both players in the battle to interact
				const isValidPlayer = interaction.user.id === session.player1Id || interaction.user.id === session.player2Id;
				return isValidPlayer && (interaction.customId.startsWith('battle_') || interaction.customId.startsWith('challenge_'));
			},
			time: this.TURN_TIMEOUT
		});

		collector.on('collect', async (interaction: ButtonInteraction) => {
			if (interaction.customId.startsWith('challenge_')) {
				await this.handleChallengeInteraction(interaction);
			} else {
				await this.handleButtonInteraction(interaction, userId);
			}
		});

		collector.on('end', async (_collected, reason) => {
			if (reason === 'time') {
				await this.handleTimeout(message, userId);
			}
			this.activeCollectors.delete(userId);
		});

		this.activeCollectors.set(userId, collector);
	}

	// Removed: Now using persistent BattleListener instead of message-based collectors

	// Legacy method - battles now use thread-based interactions
	private static async handleButtonInteraction(interaction: ButtonInteraction, _userId: string): Promise<void> {
		await interaction.reply({
			content: '❌ This battle uses the new thread system. Please check your private battle thread to select moves.',
			ephemeral: true
		});
	}

	// Removed: Move selection now handled by BattleListener


	private static async handleTimeout(message: Message, userId: string): Promise<void> {
		const timeoutResult = await BattleManager.handleTimeout(userId);

		if (timeoutResult.forfeit) {
			// User forfeited due to too many timeouts
			const forfeitEmbed = new EmbedBuilder()
				.setTitle('💀 Battle Forfeited!')
				.setColor(0xe74c3c)
				.setDescription(timeoutResult.message)
				.setFooter({ text: 'Use /battle ai to start a new battle!' });

			await message.edit({
				content: '⏰ **TIMEOUT**',
				embeds: [forfeitEmbed],
				components: []
			});
			return;
		}

		// Update battle display with timeout message
		const session = BattleManager.getBattle(userId);
		if (session) {
			const statusEmbed = session.interface.createBattleStatusEmbed(session);

			statusEmbed.addFields({
				name: '⏰ Timeout',
				value: timeoutResult.message,
				inline: false
			});

			await message.edit({
				embeds: [statusEmbed],
				components: []
			});
		}
	}

	public static stopCollector(userId: string): void {
		const collector = this.activeCollectors.get(userId);
		if (collector) {
			collector.stop('manual');
			this.activeCollectors.delete(userId);
		}
	}

	public static createChallengeCollector(message: Message): void {
		const collector = message.createMessageComponentCollector({
			componentType: ComponentType.Button,
			filter: (interaction) => {
				return interaction.customId.startsWith('challenge_');
			},
			time: 5 * 60 * 1000 // 5 minutes for challenge acceptance
		});

		collector.on('collect', async (interaction: ButtonInteraction) => {
			await this.handleChallengeInteraction(interaction);
		});

		collector.on('end', async (_collected, reason) => {
			if (reason === 'time') {
				const embed = new EmbedBuilder()
					.setTitle('⏰ Challenge Expired')
					.setColor(0x95a5a6)
					.setDescription('The battle challenge has expired.');

				await message.edit({
					content: null,
					embeds: [embed],
					components: []
				});
			}
		});
	}

	private static async handleChallengeInteraction(interaction: ButtonInteraction): Promise<void> {
		const [_, action, challengerId] = interaction.customId.split('_');
		const responderId = interaction.user.id;

		if (action === 'accept') {
			// Validate that only the challenged player can accept
			if (responderId === challengerId) {
				await interaction.reply({
					content: '❌ You cannot accept your own challenge!',
					ephemeral: true
				});
				return;
			}

			// Start a player vs player battle
			const session = BattleManager.createPlayerBattle(challengerId, responderId);

			// Create battle threads
			const threadResult = await BattleManager.createBattleThreads(session, interaction.guild!);
			if (!threadResult.success) {
				await interaction.reply({
					content: `❌ Failed to create battle threads: ${threadResult.message}`,
					ephemeral: true
				});
				return;
			}

			// Create battle log display for main thread
			const battleLogEmbed = session.interface.createBattleLogEmbed(session);

			await interaction.update({
				content: `⚔️ **Battle Started!** Check your private channels to select moves.\n\n<#${session.player1ThreadId}> - Player 1 Moves\n<#${session.player2ThreadId}> - Player 2 Moves\n<#${session.battleLogThreadId}> - Live Battle Log`,
				embeds: [battleLogEmbed],
				components: []
			});

			// Channels will be set up automatically by the event system
		} else if (action === 'decline') {
			// Validate that only the challenged player can decline
			if (responderId === challengerId) {
				await interaction.reply({
					content: '❌ You cannot decline your own challenge!',
					ephemeral: true
				});
				return;
			}

			const embed = new EmbedBuilder()
				.setTitle('❌ Challenge Declined')
				.setColor(0xe74c3c)
				.setDescription(`${interaction.user} declined the battle challenge.`);

			await interaction.update({
				content: null,
				embeds: [embed],
				components: []
			});
		}
	}

	// Removed: Channel setup now handled by ChannelUpdateListener via events

	// Removed: Channel updating now handled by BattleListener

	public static stopAllCollectors(): void {
		for (const [_userId, collector] of this.activeCollectors) {
			collector.stop('cleanup');
		}
		this.activeCollectors.clear();
	}
}

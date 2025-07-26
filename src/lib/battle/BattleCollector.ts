import { ButtonInteraction, StringSelectMenuInteraction, Message, ComponentType, InteractionCollector, EmbedBuilder } from 'discord.js';
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

	public static createSelectMenuCollector(message: Message, userId: string): void {
		// Clean up any existing collector
		this.stopCollector(userId);

		const collector = message.createMessageComponentCollector({
			componentType: ComponentType.StringSelect,
			filter: (interaction) => {
				return interaction.user.id === userId && interaction.customId.startsWith('battle_');
			},
			time: this.TURN_TIMEOUT
		});

		collector.on('collect', async (interaction: StringSelectMenuInteraction) => {
			await this.handleSelectMenuInteraction(interaction, userId);
		});

		collector.on('end', async (_collected, reason) => {
			if (reason === 'time') {
				await this.handleTimeout(message, userId);
			}
			this.activeCollectors.delete(userId);
		});

		this.activeCollectors.set(userId, collector);
	}

	private static async handleButtonInteraction(interaction: ButtonInteraction, userId: string): Promise<void> {
		const session = BattleManager.getBattle(userId);

		if (!session) {
			await interaction.reply({
				content: '❌ No active battle found! Use `/battle ai` to start a new battle.',
				ephemeral: true
			});
			return;
		}

		const action = interaction.customId.replace('battle_', '');

		switch (action) {
			case 'attack':
				await this.handleAttackAction(interaction, session, userId);
				break;
			case 'switch':
				await this.handleSwitchAction(interaction, session, userId);
				break;
			case 'item':
				await this.handleItemAction(interaction);
				break;
			case 'flee':
				await this.handleFleeAction(interaction, session, userId);
				break;
			default:
				await interaction.reply({
					content: '❌ Unknown battle action!',
					ephemeral: true
				});
				return;
		}
	}

	private static async handleSelectMenuInteraction(interaction: StringSelectMenuInteraction, userId: string): Promise<void> {
		const session = BattleManager.getBattle(userId);

		if (!session) {
			await interaction.reply({
				content: '❌ No active battle found!',
				ephemeral: true
			});
			return;
		}

		const action = interaction.customId.replace('battle_', '').replace('_select', '');
		console.log("🚀 ~ BattleCollector ~ handleSelectMenuInteraction ~ action:", action)
		const selectedValue = interaction.values[0];

		let result;

		switch (action) {
			case 'technique':
				result = await BattleManager.executePlayerAction(userId, 'attack', selectedValue);
				break;
			case 'switch':
				result = await BattleManager.executePlayerAction(userId, 'switch', selectedValue);
				break;
			default:
				await interaction.reply({
					content: '❌ Unknown selection action!',
					ephemeral: true
				});
				return;
		}

		if (!result.success) {
			await interaction.reply({
				content: `❌ ${result.message}`,
				ephemeral: true
			});
			return;
		}

		// Update battle display
		const updatedSession = BattleManager.getBattle(userId);

		if (!updatedSession) {
			// Battle ended
			const resultEmbed = session.interface.createBattleResultEmbed();
			await interaction.update({
				content: `✅ ${result.message}`,
				embeds: [resultEmbed],
				components: []
			});
			return;
		}

		// Battle continues - update the main battle message
		const statusEmbed = updatedSession.interface.createBattleStatusEmbed();
		const actionButtons = updatedSession.interface.createActionButtons();

		// Add the action result to the embed
		statusEmbed.addFields({
			name: '⚡ Last Action',
			value: result.message,
			inline: false
		});

		await interaction.update({
			embeds: [statusEmbed],
			components: [actionButtons]
		});

		// Create new collector for next turn
		const originalMessage = interaction.message as Message;
		this.createCollector(originalMessage, userId);
	}

	private static async handleAttackAction(interaction: ButtonInteraction, session: any, userId: string): Promise<void> {
		// Show technique selection menu
		const techniqueMenu = session.interface.createTechniqueSelectMenu();

		if (techniqueMenu.components.length === 0) {
			await interaction.reply({
				content: '❌ No techniques available!',
				ephemeral: true
			});
			return;
		}

		const reply = await interaction.reply({
			content: '🎯 Select a technique to use:',
			components: [techniqueMenu],
			ephemeral: true,
			fetchReply: true
		});

		// Create collector for the technique selection
		this.createSelectMenuCollector(reply as Message, userId);
	}

	private static async handleSwitchAction(interaction: ButtonInteraction, session: any, userId: string): Promise<void> {
		// Show character selection menu
		const switchMenu = session.interface.createSwitchSelectMenu();

		if (switchMenu.components.length === 0) {
			await interaction.reply({
				content: '❌ No characters available to switch to!',
				ephemeral: true
			});
			return;
		}

		const reply = await interaction.reply({
			content: '🔄 Select a character to switch to:',
			components: [switchMenu],
			ephemeral: true,
			fetchReply: true
		});

		// Create collector for the character selection
		this.createSelectMenuCollector(reply as Message, userId);
	}

	private static async handleItemAction(interaction: ButtonInteraction): Promise<void> {
		await interaction.reply({
			content: '🎒 Items system not implemented yet!',
			ephemeral: true
		});
	}

	private static async handleFleeAction(interaction: ButtonInteraction, session: any, userId: string): Promise<void> {
		// Execute flee action
		const result = await BattleManager.executePlayerAction(userId, 'flee');

		if (!result.success) {
			await interaction.reply({
				content: `❌ ${result.message}`,
				ephemeral: true
			});
			return;
		}

		// Show battle result
		const resultEmbed = session.interface.createBattleResultEmbed();

		await interaction.update({
			content: '🏃 You fled from battle!',
			embeds: [resultEmbed],
			components: []
		});

		this.stopCollector(userId);
	}

	private static async handleTimeout(message: Message, userId: string): Promise<void> {
		const timeoutResult = BattleManager.handleTimeout(userId);

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
			const statusEmbed = session.interface.createBattleStatusEmbed();
			const actionButtons = session.interface.createActionButtons();

			statusEmbed.addFields({
				name: '⏰ Timeout',
				value: timeoutResult.message,
				inline: false
			});

			await message.edit({
				embeds: [statusEmbed],
				components: [actionButtons]
			});

			// Create new collector for next turn
			this.createCollector(message, userId);
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
		const [action, , challengerId] = interaction.customId.split('_');
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

			// Create battle display
			const statusEmbed = session.interface.createBattleStatusEmbed();
			const actionButtons = session.interface.createActionButtons();

			statusEmbed.setDescription(`${interaction.user} accepted the challenge! Turn ${session.currentTurn}`);

			await interaction.update({
				content: `⚔️ **Battle Started!** Both players can now take actions.`,
				embeds: [statusEmbed],
				components: [actionButtons]
			});

			// Create collector for the battle (both players can interact)
			const message = interaction.message as Message;
			this.createCollector(message, session.player1Id);

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

	public static stopAllCollectors(): void {
		for (const [_userId, collector] of this.activeCollectors) {
			collector.stop('cleanup');
		}
		this.activeCollectors.clear();
	}
}

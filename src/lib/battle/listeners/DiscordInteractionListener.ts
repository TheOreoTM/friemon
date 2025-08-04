import { Client, Events, StringSelectMenuInteraction, ButtonInteraction } from 'discord.js';
import { BattleManager } from '../BattleManager';

export class DiscordInteractionListener {
	private client: Client;

	constructor(client: Client) {
		this.client = client;
		this.setupListeners();
	}

	private setupListeners(): void {
		this.client.on(Events.InteractionCreate, async (interaction) => {
			if (interaction.isButton()) {
				await this.handleButtonInteraction(interaction);
				return;
			}

			if (interaction.isStringSelectMenu()) {
				await this.handleSelectMenuInteraction(interaction);
				return;
			}
		});
	}

	private async handleButtonInteraction(interaction: ButtonInteraction): Promise<void> {
		const customId = interaction.customId;

		if (customId.startsWith('make_action_')) {
			await this.handleMakeActionButton(interaction);
		} else if (customId.startsWith('switch_')) {
			await this.handleSwitchButton(interaction);
		} else if (customId.startsWith('forfeit_')) {
			await this.handleForfeitButton(interaction);
		} else if (customId.startsWith('challenge_')) {
			await this.handleChallengeButton(interaction);
		}
	}

	private async handleMakeActionButton(interaction: ButtonInteraction): Promise<void> {
		const playerId = interaction.customId.replace('make_action_', '');

		if (interaction.user.id !== playerId) {
			await interaction.reply({
				content: '❌ You can only make actions for yourself!',
				ephemeral: true
			});
			return;
		}

		const session = BattleManager.getBattle(playerId);
		if (!session) {
			await interaction.reply({
				content: '❌ No active battle found!',
				ephemeral: true
			});
			return;
		}

		if (session.playerActions.get(playerId)) {
			await interaction.reply({
				content: '✅ You have already selected your action for this turn!',
				ephemeral: true
			});
			return;
		}

		// Send detailed move selection embed (ephemeral)
		const moveEmbed = session.interface.createDetailedMoveSelectionEmbed(playerId, session);
		const components = session.interface.createMoveSelectionComponents(playerId, session);

		await interaction.reply({
			embeds: [moveEmbed],
			components: components,
			ephemeral: true
		});
	}

	private async handleSelectMenuInteraction(interaction: StringSelectMenuInteraction): Promise<void> {
		const customId = interaction.customId;

		if (customId.startsWith('select_technique_')) {
			await this.handleTechniqueSelection(interaction);
		}
	}

	private async handleTechniqueSelection(interaction: StringSelectMenuInteraction): Promise<void> {
		const playerId = interaction.customId.replace('select_technique_', '');

		if (interaction.user.id !== playerId) {
			await interaction.reply({
				content: '❌ You can only select techniques for yourself!',
				ephemeral: true
			});
			return;
		}

		const session = BattleManager.getBattle(playerId);
		if (!session) {
			await interaction.reply({
				content: '❌ No active battle found!',
				ephemeral: true
			});
			return;
		}

		const selectedValue = interaction.values[0];

		if (selectedValue.startsWith('disabled_')) {
			const techniqueName = selectedValue.replace('disabled_', '');
			await interaction.reply({
				content: `❌ You don't have enough MP to use **${techniqueName}**!`,
				ephemeral: true
			});
			return;
		}

		if (selectedValue.startsWith('attack_')) {
			const techniqueName = selectedValue.replace('attack_', '');

			const result = await BattleManager.executePlayerAction(playerId, 'attack', techniqueName);

			if (result.success) {
				await interaction.update({
					content: `✅ **You selected:** ${techniqueName}\n\n*Return to the battle thread to see the results!*`,
					embeds: [],
					components: []
				});

				// Update main battle thread
				await session.battleChannel?.sendPlayerReady(playerId);

				// Check if both players are ready
				const bothReady = session.playerActions.get(session.user.id) && session.playerActions.get(session.opponent.id);
				if (bothReady) {
					const turnResult = await BattleManager.processTurn(session);
					if (!turnResult.success) {
						console.error('Failed to process turn:', turnResult.message);
					}
				}
			} else {
				await interaction.reply({
					content: `❌ ${result.message}`,
					ephemeral: true
				});
			}
		}
	}

	private async handleSwitchButton(interaction: ButtonInteraction): Promise<void> {
		const [, position, playerId] = interaction.customId.split('_');

		if (interaction.user.id !== playerId) {
			await interaction.reply({
				content: '❌ You can only switch your own characters!',
				ephemeral: true
			});
			return;
		}

		const session = BattleManager.getBattle(playerId);
		if (!session) {
			await interaction.reply({
				content: '❌ No active battle found!',
				ephemeral: true
			});
			return;
		}

		const isPlayer1 = playerId === session.user.id;
		const team = isPlayer1 ? session.battle.getUserCharacters() : session.battle.getOpponentCharacters();
		const targetCharacter = team[parseInt(position) - 1];

		if (!targetCharacter) {
			await interaction.reply({
				content: '❌ Invalid team position!',
				ephemeral: true
			});
			return;
		}

		const result = await BattleManager.executePlayerAction(playerId, 'switch', targetCharacter.name);

		if (result.success) {
			await interaction.update({
				content: `✅ **You switched to:** ${targetCharacter.name}\n\n*Return to the battle thread to see the results!*`,
				embeds: [],
				components: []
			});

			await session.battleChannel?.sendPlayerReady(playerId);

			const bothReady = session.playerActions.get(session.user.id) && session.playerActions.get(session.opponent.id);
			if (bothReady) {
				const turnResult = await BattleManager.processTurn(session);
				if (!turnResult.success) {
					console.error('Failed to process turn:', turnResult.message);
				}
			}
		} else {
			await interaction.reply({
				content: `❌ ${result.message}`,
				ephemeral: true
			});
		}
	}

	private async handleForfeitButton(interaction: ButtonInteraction): Promise<void> {
		const playerId = interaction.customId.replace('forfeit_', '');

		if (interaction.user.id !== playerId) {
			await interaction.reply({
				content: '❌ You can only forfeit for yourself!',
				ephemeral: true
			});
			return;
		}

		const result = await BattleManager.executePlayerAction(playerId, 'flee');

		if (result.success) {
			await interaction.update({
				content: `🏳️ **You forfeited the battle!**\n\n*Check the battle thread for final results.*`,
				embeds: [],
				components: []
			});
		} else {
			await interaction.reply({
				content: `❌ ${result.message}`,
				ephemeral: true
			});
		}
	}

	private async handleChallengeButton(interaction: ButtonInteraction): Promise<void> {
		// Keep existing challenge logic from your current implementation
		const [_, action, challengerId] = interaction.customId.split('_');
		const responderId = interaction.user.id;

		if (action === 'accept') {
			if (responderId === challengerId) {
				await interaction.reply({
					content: '❌ You cannot accept your own challenge!',
					ephemeral: true
				});
				return;
			}

			const session = await BattleManager.createPlayerBattle(challengerId, responderId, interaction.guild!);
			const channelResult = await BattleManager.createBattleChannel(session, interaction.guild!);

			if (!channelResult.success) {
				await interaction.reply({
					content: `❌ Failed to create battle channel: ${channelResult.message}`,
					ephemeral: true
				});
				return;
			}

			await interaction.update({
				content: `⚔️ **Battle Started!**\n🏟️ **Battle Thread:** <#${session.battleChannel?.getThread().id}>\n\n📱 **Click "Make Action" in the battle thread to select your moves!**`,
				embeds: [],
				components: []
			});
		} else if (action === 'decline') {
			// Handle decline logic
			await interaction.update({
				content: `❌ **Challenge Declined** by ${interaction.user}`,
				embeds: [],
				components: []
			});
		}
	}
}

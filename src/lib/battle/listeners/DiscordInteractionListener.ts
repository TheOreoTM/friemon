import { Client, Events, StringSelectMenuInteraction, ButtonInteraction } from 'discord.js';
import { battleEvents } from '../BattleEventEmitter';
import { BattleManager, type BattleSession } from '../BattleManager';

export class DiscordInteractionListener {
	private client: Client;

	constructor(client: Client) {
		this.client = client;
		this.setupListeners();
	}

	private setupListeners(): void {
		this.client.on(Events.InteractionCreate, async (interaction) => {
			// Handle select menu interactions
			if (interaction.isStringSelectMenu()) {
				if (interaction.customId === 'battle_move_select') {
					await this.handleBattleMoveSelect(interaction);
				}
				return;
			}

			// Handle button interactions
			if (interaction.isButton()) {
				await this.handleButtonInteraction(interaction);
				return;
			}
		});
	}

	private async handleBattleMoveSelect(interaction: StringSelectMenuInteraction): Promise<void> {
		const userId = interaction.user.id;
		const session = BattleManager.getBattle(userId);

		if (!session) {
			await interaction.reply({
				content: '❌ No active battle found!',
				ephemeral: true
			});
			return;
		}

		// Check if this interaction is in the correct player's channel
		if (!this.isPlayerInCorrectChannel(interaction, session, userId)) {
			await interaction.reply({
				content: '❌ You can only select moves in your private battle channel!',
				ephemeral: true
			});
			return;
		}

		// Emit the move selected event - other listeners will handle the processing
		battleEvents.emitMoveSelected(userId, interaction);
	}

	private async handleButtonInteraction(interaction: ButtonInteraction): Promise<void> {
		const userId = interaction.user.id;
		const session = BattleManager.getBattle(userId);

		if (!session) {
			await interaction.reply({
				content: '❌ No active battle found!',
				ephemeral: true
			});
			return;
		}

		// Check if this interaction is in the correct player's channel
		if (!this.isPlayerInCorrectChannel(interaction, session, userId)) {
			await interaction.reply({
				content: '❌ You can only interact with battle controls in your private battle channel!',
				ephemeral: true
			});
			return;
		}

		// Handle different button types
		const customId = interaction.customId;

		if (customId === 'battle_forfeit') {
			await this.handleForfeitButton(interaction, session, userId);
		} else if (customId.startsWith('switch_')) {
			await this.handleTeamSwitchButton(interaction, session, userId, customId);
		} else {
			await interaction.reply({
				content: '❌ Unknown button interaction!',
				ephemeral: true
			});
		}
	}

	private async handleForfeitButton(interaction: ButtonInteraction, session: BattleSession, userId: string): Promise<void> {
		// Execute forfeit action through BattleManager
		const result = await BattleManager.executePlayerAction(userId, 'flee');

		if (result.success) {
			await interaction.reply({
				content: `🏳️ ${result.message}`,
				ephemeral: false
			});

			// If battle is complete, emit battle completed event
			if (result.battleComplete) {
				const guild = interaction.guild;
				if (guild) {
					battleEvents.emitBattleCompleted(session, guild);
				}
			}
		} else {
			await interaction.reply({
				content: `❌ ${result.message}`,
				ephemeral: true
			});
		}
	}

	private async handleTeamSwitchButton(interaction: ButtonInteraction, session: BattleSession, userId: string, customId: string): Promise<void> {
		// Extract position from customId (e.g., "switch_1" -> "1")
		const positionMatch = customId.match(/switch_(\d+)/);
		if (!positionMatch) {
			await interaction.reply({
				content: '❌ Invalid switch button!',
				ephemeral: true
			});
			return;
		}

		const position = parseInt(positionMatch[1]);
		const isPlayer1 = userId === session.user.id;
		const team = isPlayer1 ? session.battle.getUserCharacters() : session.battle.getOpponentCharacters();

		// Get character at position (position is 1-indexed, array is 0-indexed)
		const targetCharacter = team[position - 1];
		if (!targetCharacter) {
			await interaction.reply({
				content: '❌ Invalid team position!',
				ephemeral: true
			});
			return;
		}

		// Execute switch action through BattleManager
		const result = await BattleManager.executePlayerAction(userId, 'switch', targetCharacter.name);

		if (result.success) {
			await interaction.reply({
				content: `🔄 ${result.message}`,
				ephemeral: false
			});

			// Check if both players have acted and process turn if needed
			const bothPlayersActed = session.playerActions.get(session.user.id) && session.playerActions.get(session.opponent.id);
			if (bothPlayersActed) {
				const turnResult = await BattleManager.processTurn(session);
				if (turnResult.success) {
					const guild = interaction.guild;
					if (guild) {
						if (turnResult.battleComplete) {
							battleEvents.emitBattleCompleted(session, guild);
						} else {
							battleEvents.emitTurnComplete(session, guild);
						}
					}
				}
			}
		} else {
			await interaction.reply({
				content: `❌ ${result.message}`,
				ephemeral: true
			});
		}
	}

	private isPlayerInCorrectChannel(interaction: StringSelectMenuInteraction | ButtonInteraction, session: BattleSession, userId: string): boolean {
		const channelId = interaction.channelId;

		if (userId === session.user.id) {
			return channelId === session.player1Thread?.id;
		} else if (userId === session.opponent.id) {
			return channelId === session.player2Thread?.id;
		}

		return false;
	}
}

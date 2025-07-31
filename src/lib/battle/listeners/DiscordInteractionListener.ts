import { Client, Events, StringSelectMenuInteraction } from 'discord.js';
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
			if (!interaction.isStringSelectMenu()) return;
			if (interaction.customId !== 'battle_move_select') return;

			await this.handleBattleMoveSelect(interaction);
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

	private isPlayerInCorrectChannel(interaction: StringSelectMenuInteraction, session: BattleSession, userId: string): boolean {
		const channelId = interaction.channelId;
		
		if (userId === session.player1Id) {
			return channelId === session.player1ThreadId;
		} else if (userId === session.player2Id) {
			return channelId === session.player2ThreadId;
		}
		
		return false;
	}
}
import { StringSelectMenuInteraction } from 'discord.js';
import { battleEvents } from '../BattleEventEmitter';
import { BattleManager } from '../BattleManager';

export class BattleActionListener {
	constructor() {
		this.setupListeners();
	}

	private setupListeners(): void {
		battleEvents.onMoveSelected(this.handleMoveSelected.bind(this));
	}

	private async handleMoveSelected(userId: string, interaction: StringSelectMenuInteraction): Promise<void> {
		const session = BattleManager.getBattle(userId);
		if (!session) {
			await interaction.reply({
				content: '❌ No active battle found!',
				ephemeral: true
			});
			return;
		}

		const selectedValue = interaction.values[0];
		let action: 'attack' | 'switch' | 'flee';
		let target: string | undefined;

		// Parse the selected value - only handle attacks now (switch/flee are buttons)
		if (selectedValue.startsWith('attack_')) {
			action = 'attack';
			target = selectedValue.replace('attack_', '');
		} else if (selectedValue.startsWith('disabled_')) {
			// Handle disabled technique selection
			const techniqueName = selectedValue.replace('disabled_', '');
			await interaction.reply({
				content: `❌ You don't have enough MP to use **${techniqueName}**! Select a different move.`,
				ephemeral: true
			});
			return;
		} else {
			await interaction.reply({
				content: '❌ Invalid technique selection! Please select an attack technique.',
				ephemeral: true
			});
			return;
		}

		// Execute the player action
		const result = await BattleManager.executePlayerAction(userId, action, target);

		if (!result.success) {
			await interaction.reply({
				content: `❌ ${result.message}`,
				ephemeral: true
			});
			return;
		}

		// Update the player's channel with their action status
		const playerMoveEmbed = session.interface.createPlayerMoveEmbed(userId, session);
		const isPlayer1 = userId === session.player1Id;
		
		// If player has acted, remove components. Otherwise, keep all components available
		const components = session.playerActions.get(userId) ? [] : [
			session.interface.createMoveSelectionMenu(isPlayer1),
			session.interface.createTeamSwitchButtons(userId, session),
			session.interface.createForfeitButton()
		];
		
		await interaction.update({
			embeds: [playerMoveEmbed],
			components: components
		});

		// Check if both players have now acted
		const bothPlayersActed = session.playerActions.get(session.player1Id) && session.playerActions.get(session.player2Id);
		
		if (bothPlayersActed) {
			// Process the complete turn
			const turnResult = await BattleManager.processTurn(session);
			
			if (turnResult.battleComplete) {
				// Battle is complete
				battleEvents.emitBattleCompleted(session, interaction.guild!);
			} else if (turnResult.success) {
				// Turn processed successfully
				battleEvents.emitTurnComplete(session, interaction.guild!);
			} else {
				console.error('Failed to process turn:', turnResult.message);
			}
		}
	}
}
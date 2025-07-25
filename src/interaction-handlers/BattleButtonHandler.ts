import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import type { ButtonInteraction, StringSelectMenuInteraction } from 'discord.js';
import { BattleManager } from '../lib/battle/BattleManager';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class BattleButtonHandler extends InteractionHandler {
	public override parse(interaction: ButtonInteraction) {
		if (!interaction.customId.startsWith('battle_')) return this.none();
		return this.some();
	}

	public override async run(interaction: ButtonInteraction) {
		const session = BattleManager.getBattle(interaction.user.id);

		if (!session) {
			return interaction.reply({
				content: '❌ No active battle found! Use `/battle ai` to start a new battle.',
				ephemeral: true
			});
		}

		const action = interaction.customId.replace('battle_', '');
		console.log('🚀 ~ BattleButtonHandler ~ run ~ action:', action);

		switch (action) {
			case 'attack':
				return this.handleAttackAction(interaction, session);
			case 'switch':
				return this.handleSwitchAction(interaction, session);
			case 'item':
				return this.handleItemAction(interaction, session);
			case 'flee':
				return this.handleFleeAction(interaction, session);
			default:
				return interaction.reply({
					content: '❌ Unknown battle action!',
					ephemeral: true
				});
		}
	}

	private async handleAttackAction(interaction: ButtonInteraction, session: any) {
		console.log('attack action');
		// Show technique selection menu
		const techniqueMenu = session.interface.createTechniqueSelectMenu();

		if (techniqueMenu.components.length === 0) {
			return interaction.reply({
				content: '❌ No techniques available!',
				ephemeral: true
			});
		}

		return interaction.reply({
			content: '🎯 Select a technique to use:',
			components: [techniqueMenu],
			ephemeral: true
		});
	}

	private async handleSwitchAction(interaction: ButtonInteraction, session: any) {
		// Show character selection menu
		const switchMenu = session.interface.createSwitchSelectMenu();

		if (switchMenu.components.length === 0) {
			return interaction.reply({
				content: '❌ No characters available to switch to!',
				ephemeral: true
			});
		}

		return interaction.reply({
			content: '🔄 Select a character to switch to:',
			components: [switchMenu],
			ephemeral: true
		});
	}

	private async handleItemAction(interaction: ButtonInteraction, _session: any) {
		// TODO: Implement item selection
		return interaction.reply({
			content: '🎒 Items system not implemented yet!',
			ephemeral: true
		});
	}

	private async handleFleeAction(interaction: ButtonInteraction, session: any) {
		// Execute flee action
		const result = await BattleManager.executePlayerAction(interaction.user.id, 'flee');

		if (!result.success) {
			return interaction.reply({
				content: `❌ ${result.message}`,
				ephemeral: true
			});
		}

		// Show battle result
		const resultEmbed = session.interface.createBattleResultEmbed();

		return interaction.update({
			content: '🏃 You fled from battle!',
			embeds: [resultEmbed],
			components: []
		});
	}
}

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.SelectMenu
})
export class BattleSelectMenuHandler extends InteractionHandler {
	public override parse(interaction: StringSelectMenuInteraction) {
		if (!interaction.customId.startsWith('battle_')) return this.none();
		return this.some();
	}

	public override async run(interaction: StringSelectMenuInteraction) {
		const session = BattleManager.getBattle(interaction.user.id);

		if (!session) {
			return interaction.reply({
				content: '❌ No active battle found!',
				ephemeral: true
			});
		}

		const action = interaction.customId.replace('battle_', '').replace('_select', '');
		const selectedValue = interaction.values[0];

		let result;

		switch (action) {
			case 'technique':
				result = await BattleManager.executePlayerAction(interaction.user.id, 'attack', selectedValue);
				break;
			case 'switch':
				result = await BattleManager.executePlayerAction(interaction.user.id, 'switch', selectedValue);
				break;
			default:
				return interaction.reply({
					content: '❌ Unknown selection action!',
					ephemeral: true
				});
		}

		if (!result.success) {
			return interaction.reply({
				content: `❌ ${result.message}`,
				ephemeral: true
			});
		}

		// Update battle display
		const updatedSession = BattleManager.getBattle(interaction.user.id);

		if (!updatedSession) {
			// Battle ended
			const resultEmbed = session.interface.createBattleResultEmbed();
			return interaction.update({
				content: `✅ ${result.message}`,
				embeds: [resultEmbed],
				components: []
			});
		}

		// Battle continues
		const statusEmbed = updatedSession.interface.createBattleStatusEmbed();
		const actionButtons = updatedSession.interface.createActionButtons();

		// Add the action result to the embed
		statusEmbed.addFields({
			name: '⚡ Last Action',
			value: result.message,
			inline: false
		});

		return interaction.update({
			embeds: [statusEmbed],
			components: [actionButtons]
		});
	}
}

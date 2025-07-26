import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import { BattleManager } from '../../lib/battle/BattleManager';
import { BattleCollector } from '../../lib/battle/BattleCollector';

@ApplyOptions<Command.Options>({
	description: 'View your current battle status'
})
export class BattleStatusCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName('battle-status')
				.setDescription('View your current battle status')
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const session = BattleManager.getBattle(interaction.user.id);

		if (!session) {
			const embed = new EmbedBuilder()
				.setTitle('📊 Battle Status')
				.setColor(0x3498db)
				.setDescription('You are not currently in a battle.')
				.addFields({
					name: '⚔️ How to Battle',
					value: 'Use `/battle @user` to challenge another player to a battle!',
					inline: false
				})
				.setFooter({ text: 'Challenge someone to start battling!' });

			return interaction.reply({ embeds: [embed], ephemeral: true });
		}

		// Show current battle status
		const statusEmbed = session.interface.createBattleStatusEmbed();
		const actionButtons = session.interface.createActionButtons();

		// Add additional status info
		const isPlayer1 = interaction.user.id === session.player1Id;
		const hasActed = session.playerActions.get(interaction.user.id) || false;
		const opponentId = isPlayer1 ? session.player2Id : session.player1Id;
		const opponentHasActed = session.playerActions.get(opponentId) || false;

		statusEmbed.addFields({
			name: '🎮 Your Status',
			value: [
				`• Turn: ${session.currentTurn}`,
				`• You are: Player ${isPlayer1 ? '1' : '2'}`,
				`• Your action: ${hasActed ? '✅ Submitted' : '⏳ Waiting'}`,
				`• Opponent action: ${opponentHasActed ? '✅ Submitted' : '⏳ Waiting'}`,
				`• Timeouts: ${session.timeoutCount.get(interaction.user.id) || 0}/3`
			].join('\n'),
			inline: false
		});

		const reply = await interaction.reply({
			embeds: [statusEmbed],
			components: session.battle.isComplete() ? [] : [actionButtons],
			ephemeral: true
		});

		// Create collector for battle interactions if battle is active
		if (!session.battle.isComplete()) {
			const message = await reply.fetch();
			BattleCollector.createCollector(message, interaction.user.id);
		}

		return reply;
	}
}
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { BattleManager } from '../../lib/battle/BattleManager';
import { BattleCollector } from '../../lib/battle/BattleCollector';

@ApplyOptions<Command.Options>({
	description: 'Challenge another player to battle',
	preconditions: ['RegistrationRequired']
})
export class BattleCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName('battle')
				.setDescription('Challenge another player to battle')
				.addUserOption((option) => option.setName('opponent').setDescription('Player to challenge').setRequired(true))
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const opponent = interaction.options.getUser('opponent', true);

		// Check if challenger already has an active battle
		const existingBattle = BattleManager.getBattle(interaction.user.id);
		if (existingBattle) {
			return interaction.reply({
				content: '❌ You already have an active battle!',
				ephemeral: true
			});
		}

		// Check if opponent already has an active battle
		const opponentBattle = BattleManager.getBattle(opponent.id);
		if (opponentBattle) {
			return interaction.reply({
				content: '❌ That player is already in a battle!',
				ephemeral: true
			});
		}

		if (opponent.id === interaction.user.id) {
			return interaction.reply({
				content: 'You cannot challenge yourself!',
				ephemeral: true
			});
		}

		if (opponent.bot) {
			return interaction.reply({
				content: 'You cannot challenge bots!',
				ephemeral: true
			});
		}

		const embed = new EmbedBuilder()
			.setTitle('⚔️ Battle Challenge!')
			.setColor(0xf39c12)
			.setDescription(`${interaction.user} has challenged ${opponent} to a battle!`)
			.addFields({
				name: '🎯 Challenge Details',
				value: ['• **Format:** 3v3 Team Battle', '• **Stakes:** Ranking points', '• **Timeout:** 5 minutes to accept'].join('\n')
			})
			.setFooter({ text: 'Only the challenged player can accept or decline!' });

		const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder().setCustomId(`challenge_accept_${interaction.user.id}`).setLabel('✅ Accept').setStyle(ButtonStyle.Success),
			new ButtonBuilder().setCustomId(`challenge_decline_${interaction.user.id}`).setLabel('❌ Decline').setStyle(ButtonStyle.Danger)
		);

		const reply = await interaction.reply({
			content: `${opponent}, you have been challenged!`,
			embeds: [embed],
			components: [actionRow]
		});

		// Create collector for challenge responses
		const message = await reply.fetch();
		BattleCollector.createChallengeCollector(message);

		return reply;
	}
}
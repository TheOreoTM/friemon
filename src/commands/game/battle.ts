import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { BattleManager } from '../../lib/battle/BattleManager';
import { BattleCollector } from '../../lib/battle/BattleCollector';
import { AIMindset } from '../../lib/types/enums';

@ApplyOptions<Command.Options>({
	description: 'Battle commands for challenging AI or other players'
})
export class BattleCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName('battle')
				.setDescription('Start a battle')
				.addSubcommand((subcommand) =>
					subcommand
						.setName('ai')
						.setDescription('Battle against AI')
						.addStringOption((option) =>
							option
								.setName('difficulty')
								.setDescription('AI difficulty level')
								.setRequired(true)
								.addChoices(
									{ name: 'Random', value: 'Random' },
									{ name: 'Aggressive', value: 'Aggressive' },
									{ name: 'Defensive', value: 'Defensive' },
									{ name: 'Balanced', value: 'Balanced' },
									{ name: 'Strategic', value: 'Strategic' },
									{ name: 'Masterful', value: 'Masterful' }
								)
						)
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('challenge')
						.setDescription('Challenge another player')
						.addUserOption((option) => option.setName('opponent').setDescription('Player to challenge').setRequired(true))
				)
				.addSubcommand((subcommand) => subcommand.setName('status').setDescription('View current battle status'))
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const subcommand = interaction.options.getSubcommand();

		switch (subcommand) {
			case 'ai':
				return this.handleAIBattle(interaction);
			case 'challenge':
				return this.handleChallenge(interaction);
			case 'status':
				return this.handleStatus(interaction);
			default:
				return interaction.reply({ content: 'Invalid subcommand!', ephemeral: true });
		}
	}

	private async handleAIBattle(interaction: Command.ChatInputCommandInteraction) {
		const difficulty = interaction.options.getString('difficulty', true) as keyof typeof AIMindset;

		// Check if user already has an active battle
		const existingBattle = BattleManager.getBattle(interaction.user.id);
		if (existingBattle) {
			return interaction.reply({
				content: '❌ You already have an active battle! Use `/battle status` to view it.',
				ephemeral: true
			});
		}

		// Create new AI battle
		const session = BattleManager.createAIBattle(interaction.user.id, AIMindset[difficulty]);

		// Create initial battle display
		const statusEmbed = session.interface.createBattleStatusEmbed();
		const actionButtons = session.interface.createActionButtons();

		statusEmbed.setDescription(`You are challenging the AI on **${difficulty}** difficulty!`);

		const reply = await interaction.reply({
			embeds: [statusEmbed],
			components: [actionButtons]
		});

		// Create collector for battle interactions
		const message = await reply.fetch();
		BattleCollector.createCollector(message, interaction.user.id);

		return reply;
	}

	private async handleChallenge(interaction: Command.ChatInputCommandInteraction) {
		const opponent = interaction.options.getUser('opponent', true);

		if (opponent.id === interaction.user.id) {
			return interaction.reply({
				content: 'You cannot challenge yourself!',
				ephemeral: true
			});
		}

		if (opponent.bot) {
			return interaction.reply({
				content: 'You cannot challenge bots! Use `/battle ai` instead.',
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
			.setFooter({ text: 'Click Accept to start the battle!' });

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

	private async handleStatus(interaction: Command.ChatInputCommandInteraction) {
		const session = BattleManager.getBattle(interaction.user.id);

		if (!session) {
			const embed = new EmbedBuilder()
				.setTitle('📊 Battle Status')
				.setColor(0x3498db)
				.setDescription('You are not currently in a battle.')
				.addFields(
					{
						name: '📈 Your Stats',
						value: ['**Wins:** 0', '**Losses:** 0', '**Rank:** Bronze', '**Win Rate:** 0%'].join('\n'),
						inline: true
					},
					{
						name: '🏆 Recent Battles',
						value: 'No recent battles found.',
						inline: true
					}
				)
				.setFooter({ text: 'Use /battle ai to start a new battle!' });

			return interaction.reply({ embeds: [embed] });
		}

		// Show current battle status
		const statusEmbed = session.interface.createBattleStatusEmbed();
		const actionButtons = session.interface.createActionButtons();

		const reply = await interaction.reply({
			embeds: [statusEmbed],
			components: [actionButtons]
		});

		// Create collector for battle interactions
		const message = await reply.fetch();
		BattleCollector.createCollector(message, interaction.user.id);

		return reply;
	}
}
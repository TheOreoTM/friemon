import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import { CharacterRegistry } from '../../lib/characters/CharacterRegistry';
import { getCharacterTier } from '../../lib/data/Characters';

@ApplyOptions<Command.Options>({
	description: 'List all your characters with their stats and IVs',
	preconditions: ['RegistrationRequired']
})
export class ListCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName('list')
				.setDescription('List all your characters with detailed information')
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const { db } = this.container;
		
		try {
			// Fetch user's characters from database
			const userCharacters = await db.userCharacter.findMany({
				where: { userId: interaction.user.id },
				orderBy: [
					{ level: 'desc' },
					{ ivPercent: 'desc' }
				]
			});

			const embed = new EmbedBuilder()
				.setTitle(`${interaction.user.username}'s Character Collection`)
				.setColor(0x3498db);

			if (userCharacters.length === 0) {
				embed.setDescription('You don\'t have any characters yet! Characters will spawn in chat channels - keep an eye out for them!');
				return interaction.reply({ embeds: [embed] });
			}

			embed.setDescription(`Your character collection (${userCharacters.length} characters):`);

			// Process each character and add to embed
			userCharacters.forEach((userChar, index) => {
				const characterData = CharacterRegistry.getAllCharacters().find(c => 
					c.characterName === userChar.characterName
				);
				
				if (characterData) {
					const displayInfo = characterData.getDisplayInfo();
					const tier = getCharacterTier(displayInfo.name);
					
					// Create IV summary from separate fields
					const ivSummary = `${userChar.hpIv}/${userChar.atkIv}/${userChar.defIv}/${userChar.mgAtkIv}/${userChar.mgDefIv}/${userChar.spdIv}`;
					
					embed.addFields({
						name: `${index + 1}. ${displayInfo.emoji} ${userChar.nickname || displayInfo.name}`,
						value: [
							`**Level:** ${userChar.level} | **XP:** ${userChar.currentXP}`,
							`**Max HP:** ${userChar.maxHP} | **Max Mana:** ${userChar.maxMana}`,
							`**Total IV:** ${userChar.totalIV}/186 (${userChar.ivPercent.toFixed(1)}%)`,
							`**IV Spread:** ${ivSummary}`,
							`**Tier:** ${tier} | **From:** ${userChar.obtainedFrom || 'Unknown'}`
						].join('\n'),
						inline: true
					});
				}
			});

			// Add summary stats
			const avgLevel = userCharacters.reduce((sum, char) => sum + char.level, 0) / userCharacters.length;
			const avgIV = userCharacters.reduce((sum, char) => sum + char.ivPercent, 0) / userCharacters.length;
			const bestIV = Math.max(...userCharacters.map(char => char.ivPercent));

			embed.addFields({
				name: '📊 Collection Stats',
				value: [
					`**Total Characters:** ${userCharacters.length}`,
					`**Average Level:** ${avgLevel.toFixed(1)}`,
					`**Average IV:** ${avgIV.toFixed(1)}%`,
					`**Best IV:** ${bestIV.toFixed(1)}%`
				].join('\n'),
				inline: false
			});

			return interaction.reply({ embeds: [embed] });

		} catch (error) {
			this.container.logger.error('Error fetching user characters:', error);
			
			const errorEmbed = new EmbedBuilder()
				.setTitle('Error')
				.setDescription('There was an error fetching your character collection. Please try again later.')
				.setColor(0xe74c3c);
				
			return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
		}
	}
}
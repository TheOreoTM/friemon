import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import { CharacterRegistry } from '@src/lib/characters/CharacterRegistry';
import { CharacterName } from '@src/lib/metadata/CharacterName';
import { getUser } from '@src/lib/util/db/user';

@ApplyOptions<Command.Options>({
	description: 'Start your journey by selecting a starter character',
	preconditions: [] // No preconditions - this is the registration command
})
export class StartCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption((option) =>
					option
						.setName('character')
						.setDescription('Choose your starter character')
						.setRequired(false)
						.addChoices(
							...CharacterRegistry.getStarterCharacters().map((char) => ({
								name: char.characterName,
								value: char.characterName
							}))
						)
				)
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await interaction.deferReply();

		// Check if user already exists
		// const existingUser = await this.container.db.user.findUnique({
		// 	where: { id: interaction.user.id },
		// 	include: { characters: true }
		// });

		// if (existingUser && existingUser.characters.length > 0) {
		// 	return interaction.editReply({
		// 		content: '❌ You have already started your journey! You cannot use `/start` again.'
		// 	});
		// }

		const characterName = interaction.options.getString('character') as CharacterName | null;

		// If no character specified, show available starters
		if (!characterName) {
			const starterCharacters = CharacterRegistry.getStarterCharacters();

			const embed = new EmbedBuilder()
				.setTitle('🌟 Choose Your Starter Character')
				.setDescription('Welcome to Friemon! Select your starter character to begin your journey.')
				.setColor(0x3498db)
				.addFields(
					starterCharacters.map((char) => {
						const displayInfo = char.getDisplayInfo();
						return {
							name: `${displayInfo.emoji} ${displayInfo.name}`,
							value: [
								`**Level:** ${displayInfo.level}`,
								`**Races:** ${displayInfo.races.join(', ')}`,
								`**Ability:** ${displayInfo.ability}`
							].join('\n'),
							inline: true
						};
					})
				)
				.setFooter({ text: 'Use /start character:<name> to select your starter!' });

			return interaction.editReply({ embeds: [embed] });
		}

		// Validate the selected character is a starter
		const starterCharacters = CharacterRegistry.getStarterCharacters();
		const selectedCharacter = starterCharacters.find((char) => char.characterName === characterName);

		if (!selectedCharacter) {
			return interaction.editReply({
				content: '❌ Invalid starter character! Please choose from the available starters using `/start` without arguments to see the list.'
			});
		}

		try {
			// Create or get user
			const user = await getUser(interaction.user.id);

			// // Check if they already have characters (double-check)
			// const userWithCharacters = await this.container.db.user.findUnique({
			// 	where: { id: user.id },
			// 	include: { characters: true }
			// });

			// if (userWithCharacters && userWithCharacters.characters.length > 0) {
			// 	return interaction.editReply({
			// 		content: '❌ You have already started your journey! You cannot select another starter.'
			// 	});
			// }

			// Create the character in the database
			const userCharacter = await selectedCharacter.createUserCharacter(user.id, {
				isStarter: true,
				obtainedFrom: 'starter',
				setSelected: true
			});

			const displayInfo = selectedCharacter.getDisplayInfo();
			const embed = new EmbedBuilder()
				.setTitle('🎉 Welcome to Friemon!')
				.setDescription(`You have successfully started your journey with **${displayInfo.name}**!`)
				.setColor(0x27ae60)
				.addFields(
					{
						name: '🎯 Your Starter Character',
						value: [
							`${displayInfo.emoji} **${displayInfo.name}**`,
							`**Level:** ${userCharacter.level}`,
							`**Races:** ${displayInfo.races.join(', ')}`,
							`**Ability:** ${displayInfo.ability}`
						].join('\n'),
						inline: false
					},
					{
						name: '💡 Next Steps',
						value: [
							'• Use `/character` to view your character details',
							'• Use `/battle` to start battling with opponents',
							'• Use `/me` to check your profile and stats',
							'• Collect more characters as you play!'
						].join('\n'),
						inline: false
					}
				)
				.setFooter({ text: 'Good luck on your adventure!' })
				.setTimestamp();

			return interaction.editReply({ embeds: [embed] });
		} catch (error) {
			console.error('Error in start command:', error);
			return interaction.editReply({
				content: '❌ An error occurred while setting up your starter character. Please try again.'
			});
		}
	}
}

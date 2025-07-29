import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import { CharacterRegistry } from '../../lib/characters/CharacterRegistry';

@ApplyOptions<Command.Options>({
    description: 'View available characters using the new character system'
})
export class CharactersCommand extends Command {
    public override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName('characters')
                .setDescription('View available characters')
                .addStringOption((option) =>
                    option
                        .setName('character')
                        .setDescription('View details of a specific character')
                        .setRequired(false)
                        .setAutocomplete(true)
                )
        );
    }

    public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const characterName = interaction.options.getString('character');

        if (characterName) {
            // Show specific character details
            const character = CharacterRegistry.getAllCharacters().find(char => 
                char.characterName.toLowerCase() === characterName.toLowerCase()
            );

            if (!character) {
                return interaction.reply({
                    content: '❌ Character not found!',
                    ephemeral: true
                });
            }

            const displayInfo = character.getDisplayInfo();

            const embed = new EmbedBuilder()
                .setTitle(`${displayInfo.emoji} ${displayInfo.name}`)
                .setColor(displayInfo.color)
                .setDescription(displayInfo.description || 'A skilled fighter ready for battle')
                .addFields(
                    {
                        name: '📊 Basic Info',
                        value: [
                            `**Level:** ${displayInfo.level}`,
                            `**Races:** ${displayInfo.races.join(', ')}`,
                            `**Total Stats:** ${displayInfo.statTotal}`
                        ].join('\n'),
                        inline: true
                    },
                    {
                        name: '⚡ Base Stats',
                        value: [
                            `HP: ${character.baseStats.hp}`,
                            `ATK: ${character.baseStats.attack}`,
                            `DEF: ${character.baseStats.defense}`,
                            `M.ATK: ${character.baseStats.magicAttack}`,
                            `M.DEF: ${character.baseStats.magicDefense}`,
                            `SPD: ${character.baseStats.speed}`
                        ].join('\n'),
                        inline: true
                    },
                    {
                        name: '🎭 Ability',
                        value: `**${displayInfo.ability}**\n${displayInfo.abilityDescription}`,
                        inline: false
                    },
                    {
                        name: '⚔️ Techniques',
                        value: character.techniques.map(tech => 
                            `• **${tech.name}** (${tech.manaCost} MP) - ${tech.power} power`
                        ).join('\n') || 'No techniques available',
                        inline: false
                    }
                );


            return interaction.reply({ embeds: [embed] });
        }

        // Show all characters
        const characters = CharacterRegistry.getAllCharacters();
        const starterCharacters = CharacterRegistry.getStarterCharacters();

        const embed = new EmbedBuilder()
            .setTitle('🎮 Available Characters')
            .setColor(0x3498db)
            .setDescription('Here are all the characters available in the new character system:');

        // Add starter characters
        if (starterCharacters.length > 0) {
            const starterList = starterCharacters.map(char => {
                const info = char.getDisplayInfo();
                return `${info.emoji} **${info.name}** (Level ${info.level}) - ${info.statTotal} total stats`;
            }).join('\n');

            embed.addFields({
                name: '⭐ Starter Characters',
                value: starterList,
                inline: false
            });
        }

        // Add all characters
        const allCharactersList = characters.map(char => {
            const info = char.getDisplayInfo();
            const raceEmojis = {
                'Human': '👤',
                'Elf': '🧝',
                'Dwarf': '⛏️',
                'Demon': '👹',
                'Monster': '🐺'
            };
            const raceEmoji = raceEmojis[info.races[0] as keyof typeof raceEmojis] || '❓';
            return `${info.emoji} **${info.name}** ${raceEmoji} (${info.races.join('/')})`;
        }).join('\n');

        embed.addFields({
            name: '📋 All Characters',
            value: allCharactersList || 'No characters available',
            inline: false
        });

        embed.addFields({
            name: '💡 Usage',
            value: 'Use `/characters <name>` to view detailed information about a specific character.\nUse `/battle @user` to start a battle using these characters!',
            inline: false
        });

        embed.setFooter({
            text: `Total Characters: ${characters.length} | New Character System Active`
        });

        return interaction.reply({ embeds: [embed] });
    }

    public override async autocompleteRun(interaction: Command.AutocompleteInteraction) {
        const focusedValue = interaction.options.getFocused();
        const characters = CharacterRegistry.getAllCharacters();
        
        const filtered = characters
            .filter(char => char.characterName.toLowerCase().includes(focusedValue.toLowerCase()))
            .slice(0, 25) // Discord's limit
            .map(char => ({
                name: `${char.getDisplayInfo().emoji} ${char.characterName}`,
                value: char.characterName
            }));

        await interaction.respond(filtered);
    }
}
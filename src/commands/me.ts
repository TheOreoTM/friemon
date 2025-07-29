import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';

@ApplyOptions<Command.Options>({
	description: 'Get your database data',
	preconditions: ['RegistrationRequired']
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder //
				.setName(this.name)
				.setDescription(this.description)
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await interaction.deferReply();
		const user = await this.container.db.user.findUnique({ 
			where: { id: interaction.user.id },
			include: { 
				characters: true,
				battles: true 
			}
		});

		if (!user) {
			return interaction.editReply('❌ User not found. This should not happen if you are registered.');
		}

		return interaction.editReply(`\`\`\`json\n${JSON.stringify(user, null, 2)}\n\`\`\``);
	}
}

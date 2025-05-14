import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';

@ApplyOptions<Command.Options>({
	description: 'Get your database data'
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
		const user = await this.container.db.user.findUnique({ where: { id: interaction.user.id } });

		if (!user) {
			await this.container.db.user.create({ data: { id: interaction.user.id } });
		}

		return interaction.reply(`\`\`\`json\n${JSON.stringify(user, null, 2)}\n\`\`\``);
	}
}

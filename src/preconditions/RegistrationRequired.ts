import { AllFlowsPrecondition } from '@sapphire/framework';
import { getUser } from '@src/lib/util/db/user';
import type { CommandInteraction, ContextMenuCommandInteraction, Message, Snowflake } from 'discord.js';

export class UserPrecondition extends AllFlowsPrecondition {
	public override async chatInputRun(interaction: CommandInteraction) {
		return await this.doRegistrationCheck(interaction.user.id);
	}

	public override async contextMenuRun(interaction: ContextMenuCommandInteraction) {
		return await this.doRegistrationCheck(interaction.user.id);
	}

	public override async messageRun(message: Message) {
		return await this.doRegistrationCheck(message.author.id);
	}

	private async doRegistrationCheck(userId: Snowflake) {
		const user = await getUser(userId);
		if (user.id) {
			return this.ok();
		}
		return this.error();
	}
}

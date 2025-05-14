import { container, SapphireClient } from '@sapphire/framework';
import { PrismaClient } from '@prisma/client';
import { CLIENT_CONFIG } from '@src/config';

export class FriemonClient<Ready extends boolean = boolean> extends SapphireClient<Ready> {
	public constructor() {
		super(CLIENT_CONFIG);
		container.db = new PrismaClient();
	}

	public override async login(token?: string): Promise<string> {
		return super.login(token);
	}

	public override destroy() {
		return super.destroy();
	}
}

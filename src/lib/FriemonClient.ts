import { container, SapphireClient } from '@sapphire/framework';
import { CLIENT_CONFIG } from '../config';
import { PrismaClient } from '@prisma/client';

export class FriemonClient<Ready extends boolean = boolean> extends SapphireClient<Ready> {
	public constructor() {
		super(CLIENT_CONFIG);
	}

	public override async login(token?: string): Promise<string> {
		container.db = new PrismaClient();

		return super.login(token);
	}

	public override destroy() {
		return super.destroy();
	}
}

import { container, SapphireClient } from '@sapphire/framework';
import { PrismaClient } from '@prisma/client';
import { CLIENT_CONFIG } from '@src/config';
import { battleSystem } from './battle/BattleSystemManager';

export class FriemonClient<Ready extends boolean = boolean> extends SapphireClient<Ready> {
	public constructor() {
		super(CLIENT_CONFIG);
		container.db = new PrismaClient();
	}

	public override async login(token?: string): Promise<string> {
		const result = await super.login(token);
		
		// Initialize battle system after login
		battleSystem.initialize(this);
		
		return result;
	}

	public override destroy() {
		return super.destroy();
	}
}

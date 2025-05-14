import { container, SapphireClient } from '@sapphire/framework';
import { PrismaClient } from '@prisma/client';
import { GameDataService } from '@src/lib/gameDataService';
import { CLIENT_CONFIG } from '@src/config';
import { BattleManager } from '@src/game/battleManager';

export class FriemonClient<Ready extends boolean = boolean> extends SapphireClient<Ready> {
	public constructor() {
		super(CLIENT_CONFIG);
		container.gameData = new GameDataService();
		container.battleManager = new BattleManager();
		container.db = new PrismaClient();
	}

	public override async login(token?: string): Promise<string> {
		await container.gameData.loadData();

		return super.login(token);
	}

	public override destroy() {
		return super.destroy();
	}
}

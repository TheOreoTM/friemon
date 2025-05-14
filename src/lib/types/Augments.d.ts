import '@sapphire/pieces';
import type { ArrayString } from '@skyra/env-utilities';
import { PrismaClient } from '@prisma/client';
import type { GameDataService } from '@src/lib/gameDataService';
import type { BattleManager } from '@src/game/battleManager';

declare module '@sapphire/framework' {
	interface Preconditions {
		OwnerOnly: never;
	}
}

declare module '@skyra/env-utilities' {
	interface Env {
		OWNERS: ArrayString;
	}
}

declare module '@sapphire/pieces' {
	interface Container {
		db: PrismaClient;
		gameData: GameDataService;
		battleManager: BattleManager;
	}
}

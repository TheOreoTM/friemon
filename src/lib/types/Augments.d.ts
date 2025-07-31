import '@sapphire/pieces';
import type { ArrayString } from '@skyra/env-utilities';
import { PrismaClient } from '@prisma/client';

declare module '@sapphire/framework' {
	interface Preconditions {
		OwnerOnly: never;
		RegistrationRequired: never;
	}
}

declare module '@skyra/env-utilities' {
	interface Env {
		OWNERS: ArrayString;
		GAME_CHANNEL: string;
	}
}

declare module '@sapphire/pieces' {
	interface Container {
		db: PrismaClient;
	}
}

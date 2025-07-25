import '@sapphire/pieces';
import type { ArrayString } from '@skyra/env-utilities';
import { PrismaClient } from '@prisma/client';

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
	}
}

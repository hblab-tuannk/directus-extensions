import { defineHook } from '@directus/extensions-sdk';
import { loadConfig } from './config';
import registerExpiredItemsHook from './items-hook';
import {
	registerAutoDisplayEndFieldHook,
	migrateDisplayEndFieldOnStartup
} from './optional-field-hook';

export default defineHook((hookContext, context) => {
	registerExpiredItemsHook(hookContext as any, context as any);
	registerAutoDisplayEndFieldHook(hookContext as any, context as any);
	void migrateDisplayEndFieldOnStartup(context as any);
});

import { loadConfig } from './config';

export function registerAutoDisplayEndFieldHook(
	hookContext: any,
	servicesContext: any,
) {
  const config = loadConfig();
	const { action } = hookContext;
	const { getSchema, services, logger } = servicesContext;
	if (!config.autoCreateDisplayEndField) return;

	action('collections.create', async (
		{ key }: { key: string },
	) => {
		const collection = key;

		try {
			const fullSchema = await getSchema();

			const collectionInfo = fullSchema.collections[collection];
			if (!collectionInfo) return;

			if (collectionInfo.fields && collectionInfo.fields[config.displayEndDateField]) {
				return;
			}

			const FieldsService = services.FieldsService;
			const fieldsService = new FieldsService({
				schema: fullSchema,
				accountability: { admin: true }
			});

			await fieldsService.createField(collection, {
				field: config.displayEndDateField,
				type: config.fieldType,
				meta: {
					interface: config.fieldInterface,
					special: null,
					hidden: false,
					readonly: false,
					required: false
				},
				schema: {
					default_value: null,
					is_nullable: true
				}
			});

		} catch (error) {
			logger?.error?.(
				`[filter-expired-posts] Error auto-creating display end date field on collection "${collection}": ${error}`
			);
		}
	});
}

export async function migrateDisplayEndFieldOnStartup(
	servicesContext: any,
) {
    const config = loadConfig();
	const { getSchema, services, logger } = servicesContext;
	if (!config.autoCreateDisplayEndField) return;

	try {
		const fullSchema = await getSchema();
		const allCollections = Object.keys(fullSchema.collections || {});

		const targetCollections = config.collectionsAllowList
			? allCollections.filter((c) => config.collectionsAllowList!.includes(c))
			: allCollections;

		const FieldsService = services.FieldsService;
		const fieldsService = new FieldsService({
			schema: fullSchema,
			accountability: { admin: true }
		});

		for (const collection of targetCollections) {
			const collectionInfo = fullSchema.collections[collection];
			if (!collectionInfo) continue;

			if (collectionInfo.fields && collectionInfo.fields[config.displayEndDateField]) {
				continue;
			}

			try {
				await fieldsService.createField(collection, {
					field: config.displayEndDateField,
					type: config.fieldType,
					meta: {
						interface: config.fieldInterface,
						special: null,
						hidden: false,
						readonly: false,
						required: false
					},
					schema: {
						default_value: null,
						is_nullable: true
					}
				});

			} catch (error) {
				logger?.error?.(
					`[filter-expired-posts] Startup migration error for collection "${collection}": ${error}`
				);
			}
		}
	} catch (error) {
		logger?.error?.(
			`[filter-expired-posts] Failed startup migration for display end date field: ${error}`
		);
	}
}



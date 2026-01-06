import { defineHook } from '@directus/extensions-sdk';
import type { Item } from '@directus/types';

export default defineHook(({ action }, { getSchema, services, logger }) => {

	action('items.read', async ({ payload, collection, key }, { schema }) => {
		try {
			const fullSchema = await getSchema();
			const collectionInfo = fullSchema.collections[collection];

			if (!collectionInfo) {
				return;
			}

			const displayEndDateField = Object.keys(collectionInfo.fields || {}).find(
				(fieldName) =>
					fieldName.toLowerCase().includes('display') &&
					fieldName.toLowerCase().includes('end') &&
					fieldName.toLowerCase().includes('date')
			);

			if (!displayEndDateField) {
				return;
			}

			const itemsService = new services.ItemsService(collection, {
				schema: fullSchema,
				accountability: { admin: true }
			});

			const now = new Date();
			const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			
			let itemsToCheck: Item[] = [];

			if (payload) {
				itemsToCheck = Array.isArray(payload) ? payload : [payload];
			} else if (key) {
				try {
					const item = await itemsService.readOne(key);
					if (item) {
						itemsToCheck = [item];
					}
				} catch (error) {
					return;
				}
			} else {
				try {
					itemsToCheck = (await itemsService.readByQuery({
						filter: {
							_and: [
							{ status: { _eq: 'published' } },
							{ [displayEndDateField]: { _nnull: true } }
							]
						},
						limit: -1
					})) as Item[];
				} catch (error) {
					return;
				}
			}


			for (const item of itemsToCheck) {
				if (!item || !item.id) continue;

				const endDate = item[displayEndDateField] as string | null | undefined;

				if (!endDate) {
					continue;
				}

				if (item.status !== 'published') {
					continue;
				}

				try {
					const endDateObj = new Date(endDate);

					if (isNaN(endDateObj.getTime())) {
						continue;
					}

					const endDateOnly = new Date(endDateObj.getFullYear(), endDateObj.getMonth(), endDateObj.getDate());

					if (endDateOnly < today) {
						const endDateStr = endDateOnly.toISOString().split('T')[0];
						const todayStr = today.toISOString().split('T')[0];
						
						try {
							await itemsService.updateOne(item.id, {
								status: 'draft'
							});
						} catch (updateError) {
							console.error(`[filter-expired-posts] Error updating item ${item.id}: ${updateError}`);
						}
					} else {
						const endDateStr = endDateOnly.toISOString().split('T')[0];
						const todayStr = today.toISOString().split('T')[0];
					}
				} catch (error) {
				}
			}
		} catch (error) {
		}
	});
});


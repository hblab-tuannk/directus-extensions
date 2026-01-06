import { defineHook } from '@directus/extensions-sdk';
import type { Item } from '@directus/types';

export default defineHook(({ action }, { getSchema, services, logger }) => {
	logger?.info('[filter-expired-posts] Hook registered successfully');
	console.log('[filter-expired-posts] Hook registered successfully');

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

			logger?.info(`[filter-expired-posts] Processing collection "${collection}" with field "${displayEndDateField}"`);
			console.log(`[filter-expired-posts] Processing collection "${collection}" with field "${displayEndDateField}"`);

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
					logger?.warn(`[filter-expired-posts] Error reading item ${key}: ${error}`);
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
					logger?.warn(`[filter-expired-posts] Error reading items: ${error}`);
					return;
				}
			}

			logger?.info(`[filter-expired-posts] Checking ${itemsToCheck.length} items for expiration (comparing dates only)`);
			console.log(`[filter-expired-posts] Checking ${itemsToCheck.length} items for expiration (comparing dates only)`);

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
						logger?.warn(`[filter-expired-posts] Invalid date for item ${item.id}: ${endDate}`);
						continue;
					}

					const endDateOnly = new Date(endDateObj.getFullYear(), endDateObj.getMonth(), endDateObj.getDate());

					if (endDateOnly < today) {
						const endDateStr = endDateOnly.toISOString().split('T')[0];
						const todayStr = today.toISOString().split('T')[0];
						logger?.info(`[filter-expired-posts] Item ${item.id} expired (${endDateStr} < ${todayStr}), updating status to draft`);
						console.log(`[filter-expired-posts] Item ${item.id} expired (${endDateStr} < ${todayStr}), updating status to draft`);
						
						try {
							await itemsService.updateOne(item.id, {
								status: 'draft'
							});
							logger?.info(`[filter-expired-posts] Successfully updated item ${item.id} to draft`);
							console.log(`[filter-expired-posts] Successfully updated item ${item.id} to draft`);
						} catch (updateError) {
							logger?.error(`[filter-expired-posts] Error updating item ${item.id}: ${updateError}`);
							console.error(`[filter-expired-posts] Error updating item ${item.id}: ${updateError}`);
						}
					} else {
						const endDateStr = endDateOnly.toISOString().split('T')[0];
						const todayStr = today.toISOString().split('T')[0];
						logger?.debug(`[filter-expired-posts] Item ${item.id} not expired yet (${endDateStr} >= ${todayStr})`);
					}
				} catch (error) {
					logger?.warn(`[filter-expired-posts] Error parsing end date for item ${item.id}: ${error}`);
					console.warn(`[filter-expired-posts] Error parsing end date for item ${item.id}: ${error}`);
				}
			}
		} catch (error) {
			logger?.error(`[filter-expired-posts] Error in action hook: ${error}`);
			console.error(`[filter-expired-posts] Error in action hook: ${error}`);
		}
	});
});


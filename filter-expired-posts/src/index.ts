import { defineHook } from '@directus/extensions-sdk';
import type { Item } from '@directus/types';

export default defineHook(({ filter }, { getSchema, logger }) => {

	filter('items.read', async (payload, { collection }, { accountability: _accountability }) => {

		const schema = await getSchema();
		const collectionInfo = schema.collections[collection];

		const displayEndDateField = Object.keys(collectionInfo?.fields || {}).find(
			(fieldName) =>
				fieldName.toLowerCase().includes('display') &&
				fieldName.toLowerCase().includes('end') &&
				fieldName.toLowerCase().includes('date')
		);

		if (!collectionInfo || !displayEndDateField) {
			return payload;
		}

		const items = Array.isArray(payload) ? payload : [payload];
		const now = new Date();

		const processedItems = items.map((item: Item) => {
			const endDate = item[displayEndDateField] as string | null | undefined;

			if (endDate && item.status === 'published') {
				try {
					const endDateObj = new Date(endDate);

					if (endDateObj < now) {
						logger?.info(`[filter-expired-posts] Item ${item.id} has expired, changing status from published to draft`);

						return {
							...item,
							status: 'draft'
						};
					}
				} catch (error) {
					logger?.warn(`[filter-expired-posts] Error parsing end date for item ${item.id}: ${error}`);
				}
			}

			return item;
		});

		return Array.isArray(payload) ? processedItems : processedItems[0];
	});
});


import type { Item } from "@directus/types";
import { loadConfig } from "./config";
import type { HookConfig } from "@directus/extensions";

const registerExpiredItemsHook: HookConfig = (
  { action },
  { getSchema, services, logger },
) => {
  const config = loadConfig();
  action("items.read", async ({ payload, collection, key }, { schema }) => {
    try {
      if (
        config.collectionsAllowList &&
        !config.collectionsAllowList.includes(collection)
      ) {
        return;
      }

      const fullSchema = await getSchema();
      const collectionInfo = fullSchema.collections[collection];

      if (!collectionInfo) return;

      let displayEndDateField = Object.prototype.hasOwnProperty.call(
        collectionInfo.fields || {},
        config.displayEndDateField
      )
        ? config.displayEndDateField
        : Object.keys(collectionInfo.fields || {}).find(
            (fieldName) =>
              fieldName.toLowerCase().includes("display") &&
              fieldName.toLowerCase().includes("end") &&
              fieldName.toLowerCase().includes("date")
          );

      if (!displayEndDateField) return;

      const itemsService = new services.ItemsService(collection, {
        schema: fullSchema,
        accountability: { admin: true },
      });

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      let itemsToCheck: Item[] = [];

      if (payload) {
        itemsToCheck = Array.isArray(payload) ? payload : [payload];
      } else if (key) {
        try {
          const item = await itemsService.readOne(key);
          if (item) itemsToCheck = [item];
        } catch {
          return;
        }
      } else {
        try {
          itemsToCheck = (await itemsService.readByQuery({
            filter: {
              _and: [
                { [config.statusField]: { _eq: config.statusPublished } },
                { [displayEndDateField]: { _nnull: true } },
              ],
            },
            limit: -1,
          })) as Item[];
        } catch {
          return;
        }
      }

      for (const item of itemsToCheck) {
        if (!item || !item.id) continue;

        const endDate = item[displayEndDateField] as string | null | undefined;

        if (!endDate) continue;

        if (item[config.statusField] !== config.statusPublished) continue;

        let endDateOnly: Date;

        try {
          const endDateObj = new Date(endDate);
          if (isNaN(endDateObj.getTime())) {
            continue;
          }

          endDateOnly = new Date(
            endDateObj.getFullYear(),
            endDateObj.getMonth(),
            endDateObj.getDate()
          );
        } catch {
          continue;
        }

        if (endDateOnly < today) {
          try {
            await itemsService.updateOne(item.id, {
              [config.statusField]: config.statusDraft,
            });
          } catch (updateError) {
            logger?.error?.(
              `[filter-expired-posts] Error updating item ${item.id} in "${collection}": ${updateError}`
            );
          }
        }
      }
    } catch (error) {
      logger?.error?.(
        `[filter-expired-posts] Unexpected error in items.read handler for "${collection}": ${error}`
      );
    }
  });
};

export default registerExpiredItemsHook;

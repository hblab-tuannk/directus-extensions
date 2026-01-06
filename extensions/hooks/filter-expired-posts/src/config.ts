export interface ExpiredPostsConfig {
	/**
	 * Name of the display end date field.
	 * Default: "display_end_date"
	 */
	displayEndDateField: string;

	/**
	 * Name of the status field.
	 * Default: "status"
	 */
	statusField: string;

	/**
	 * Published status value.
	 * Default: "published"
	 */
	statusPublished: string;

	/**
	 * Draft status value.
	 * Default: "draft"
	 */
	statusDraft: string;

	/**
	 * Optional allow-list of collections (comma-separated) that should be processed.
	 * If empty, all collections are eligible.
	 */
	collectionsAllowList: string[] | null;

	/**
	 * Automatically create the display end date field when a new collection is created.
	 * Default: true
	 */
	autoCreateDisplayEndField: boolean;

	/**
	 * Field type used when auto-creating the display end date field.
	 * Default: "date"
	 */
	fieldType: string;

	/**
	 * Interface used when auto-creating the display end date field.
	 * Default: "display-end-date"
	 */
	fieldInterface: string;
}

export function loadConfig(): ExpiredPostsConfig {
	const {
		FILTER_EXPIRED_DISPLAY_FIELD,
		FILTER_EXPIRED_STATUS_FIELD,
		FILTER_EXPIRED_STATUS_PUBLISHED,
		FILTER_EXPIRED_STATUS_DRAFT,
		FILTER_EXPIRED_COLLECTIONS,
		FILTER_EXPIRED_AUTOCREATE_FIELD,
		FILTER_EXPIRED_FIELD_TYPE,
		FILTER_EXPIRED_INTERFACE
	} = process.env;

	return {
		displayEndDateField: FILTER_EXPIRED_DISPLAY_FIELD || 'display_end_date',
		statusField: FILTER_EXPIRED_STATUS_FIELD || 'status',
		statusPublished: FILTER_EXPIRED_STATUS_PUBLISHED || 'published',
		statusDraft: FILTER_EXPIRED_STATUS_DRAFT || 'draft',
		collectionsAllowList: FILTER_EXPIRED_COLLECTIONS
			? FILTER_EXPIRED_COLLECTIONS.split(',').map((c) => c.trim()).filter(Boolean)
			: null,
		autoCreateDisplayEndField:
			(FILTER_EXPIRED_AUTOCREATE_FIELD || 'true').toLowerCase() === 'true',
		fieldType: FILTER_EXPIRED_FIELD_TYPE || 'date',
		fieldInterface: FILTER_EXPIRED_INTERFACE || 'display-end-date'
	};
}


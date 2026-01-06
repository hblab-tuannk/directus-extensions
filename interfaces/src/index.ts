import { defineInterface } from '@directus/extensions-sdk';

export default defineInterface({
	id: 'display-end-date',
	name: 'Display End Date',
	icon: 'event',
	description: 'Date picker for setting when content should stop being displayed. Posts with end date in the past will be filtered out from API queries.',
	component: () => import('./display-end-date.vue'),
	options: [
		{
			field: 'includeTime',
			name: 'Include Time',
			type: 'boolean',
			meta: {
				width: 'half',
				interface: 'boolean',
				options: {
					label: 'Include time in date picker'
				}
			},
			schema: {
				default_value: true
			}
		}
	],
	types: ['dateTime', 'timestamp', 'date']
});

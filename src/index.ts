import { defineInterface } from '@directus/extensions-sdk';

export default defineInterface({
	id: 'slug-generator',
	name: 'Slug Generator',
	icon: 'link',
	description: 'Generate URL-friendly slugs from text input',
	component: () => import('./slug-generator.vue'),
	options: [
		{
			field: 'separator',
			name: 'Separator',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'select-dropdown',
				options: {
					choices: [
						{ text: 'Hyphen (-)', value: '-' },
						{ text: 'Underscore (_)', value: '_' }
					]
				}
			},
			schema: {
				default_value: '-'
			}
		},
		{
			field: 'lowercase',
			name: 'Lowercase',
			type: 'boolean',
			meta: {
				width: 'half',
				interface: 'boolean',
				options: {
					label: 'Convert to lowercase'
				}
			},
			schema: {
				default_value: true
			}
		}
	],
	types: ['string']
});


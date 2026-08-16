// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Royi Guides',
			defaultLocale: 'root',
			locales: {
				root: {
					label: 'עברית',
					lang: 'he',
					dir: 'rtl',
				},
			},
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/royiy/royi_guides' }],
			sidebar: [
				{
					label: 'DevOps',
					items: [
						{ autogenerate: { directory: 'devops' } },
					],
				},
			],
		}),
	],
});

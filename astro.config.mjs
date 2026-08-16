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
					label: 'AWS',
					items: [
						{ autogenerate: { directory: 'aws' } },
					],
				},
				{
					label: 'Linux',
					items: [
						{ autogenerate: { directory: 'linux' } },
					],
				},
				{
					label: 'Windows Server',
					items: [
						{ autogenerate: { directory: 'windows-server' } },
					],
				},
				{
					label: 'DevOps',
					items: [
						{ autogenerate: { directory: 'devops' } },
					],
				},
				{
					label: 'VMware',
					items: [
						{ autogenerate: { directory: 'vmware' } },
					],
				},
				{
					label: 'Terraform',
					items: [
						{ autogenerate: { directory: 'terraform' } },
					],
				},
				{
					label: 'PowerShell',
					items: [
						{ autogenerate: { directory: 'powershell' } },
					],
				},
			],
		}),
	],
});

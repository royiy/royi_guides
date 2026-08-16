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
					collapsed: true,
					items: [
						{ autogenerate: { directory: 'aws' } },
					],
				},
				{
					label: 'Linux',
					collapsed: true,
					items: [
						{ autogenerate: { directory: 'linux' } },
					],
				},
				{
					label: 'Windows Server',
					collapsed: true,
					items: [
						{ autogenerate: { directory: 'windows-server' } },
					],
				},
				{
					label: 'DevOps',
					collapsed: true,
					items: [
						{
							label: 'Git',
							collapsed: true,
							autogenerate: { directory: 'devops/git' },
						},
						{
							label: 'CI/CD',
							collapsed: true,
							autogenerate: { directory: 'devops/cicd' },
						},
						{
							label: 'Docker',
							collapsed: true,
							autogenerate: { directory: 'devops/docker' },
						},
						{
							label: 'Kubernetes',
							collapsed: true,
							autogenerate: { directory: 'devops/kubernetes' },
						},
					],
				},
				{
					label: 'VMware',
					collapsed: true,
					items: [
						{ autogenerate: { directory: 'vmware' } },
					],
				},
				{
					label: 'Terraform',
					collapsed: true,
					items: [
						{ autogenerate: { directory: 'terraform' } },
					],
				},
				{
					label: 'PowerShell',
					collapsed: true,
					items: [
						{ autogenerate: { directory: 'powershell' } },
					],
				},
			],
		}),
	],
});

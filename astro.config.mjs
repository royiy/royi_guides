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

			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/royiy/royi_guides',
				},
			],

			sidebar: [
				// =========================
				// AWS
				// =========================
				{
					label: 'AWS',
					collapsed: true,
					items: [
						{
							autogenerate: {
								directory: 'aws',
							},
						},
					],
				},

				// =========================
				// Linux
				// =========================
				{
					label: 'Linux',
					collapsed: true,
					items: [
						{
							autogenerate: {
								directory: 'linux',
							},
						},
					],
				},

				// =========================
				// Windows Server
				// =========================
				{
					label: 'Windows Server',
					collapsed: true,
					items: [
						{
							autogenerate: {
								directory: 'windows-server',
							},
						},
					],
				},

				// =========================
				// DevOps
				// =========================
				{
					label: 'DevOps',
					collapsed: true,
					items: [
						{
							label: 'Git',
							collapsed: true,
							items: [
								{
									autogenerate: {
										directory: 'devops/git',
									},
								},
							],
						},

						{
							label: 'CI/CD',
							collapsed: true,
							items: [
								{
									autogenerate: {
										directory: 'devops/cicd',
									},
								},
							],
						},

						{
							label: 'Docker',
							collapsed: true,
							items: [
								{
									autogenerate: {
										directory: 'devops/docker',
									},
								},
							],
						},

						{
							label: 'Kubernetes',
							collapsed: true,
							items: [
								{
									autogenerate: {
										directory: 'devops/kubernetes',
									},
								},
							],
						},
					],
				},

				// =========================
				// VMware
				// =========================
				{
					label: 'VMware',
					collapsed: true,
					items: [
						{
							autogenerate: {
								directory: 'vmware',
							},
						},
					],
				},

				// =========================
				// Terraform
				// =========================
				{
					label: 'Terraform',
					collapsed: true,
					items: [
						{
							autogenerate: {
								directory: 'terraform',
							},
						},
					],
				},

				// =========================
				// PowerShell
				// =========================
				{
					label: 'PowerShell',
					collapsed: true,
					items: [
						{
							autogenerate: {
								directory: 'powershell',
							},
						},
					],
				},
			],
		}),
	],
});
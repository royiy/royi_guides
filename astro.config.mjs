// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://royi-guides.vercel.app',

	integrations: [
		sitemap(),
		starlight({
			title: 'Royi Guides',
			description: 'מדריכים מקיפים בעברית ל-DevOps, Cloud, Linux, Windows Server ותשתיות IT - Ansible, Kubernetes, Docker, Terraform, AWS, Azure, GCP ועוד.',

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

			components: {
				Footer: './src/components/Footer.astro',
			},

			head: [
				{
					tag: 'meta',
					attrs: { property: 'og:image', content: 'https://royi-guides.vercel.app/og-image.png' },
				},
				{
					tag: 'meta',
					attrs: { name: 'twitter:card', content: 'summary_large_image' },
				},
				{
					tag: 'meta',
					attrs: { name: 'twitter:image', content: 'https://royi-guides.vercel.app/og-image.png' },
				},
			],

			sidebar: [
				// =========================
				// AI
				// =========================
				{
					label: 'AI',
					collapsed: true,
					items: [
						{
							autogenerate: {
								directory: 'AI',
							},
						},
					],
				},

				// =========================
				// API
				// =========================
				{
					label: 'API',
					collapsed: true,
					items: [
						{
							autogenerate: {
								directory: 'api',
							},
						},
					],
				},

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
				// Azure
				// =========================
				{
					label: 'Azure',
					collapsed: true,
					items: [
						{
							autogenerate: {
								directory: 'azure',
							},
						},
					],
				},

				// =========================
				// GCP
				// =========================
				{
					label: 'GCP',
					collapsed: true,
					items: [
						{
							autogenerate: {
								directory: 'gcp',
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
				// Networking
				// =========================
				{
					label: 'Networking',
					collapsed: true,
					items: [
						{
							autogenerate: {
								directory: 'networking',
							},
						},
					],
				},

				// =========================
				// Check Point
				// =========================
				{
					label: 'Check Point',
					collapsed: true,
					items: [
						{
							autogenerate: {
								directory: 'checkpoint',
							},
						},
					],
				},

				// =========================
				// Fortinet
				// =========================
				{
					label: 'Fortinet',
					collapsed: true,
					items: [
						{
							autogenerate: {
								directory: 'fortinet',
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

						{
							label: 'Helm',
							collapsed: true,
							items: [
								{
									autogenerate: {
										directory: 'devops/helm',
									},
								},
							],
						},

						{
							label: 'Ansible',
							collapsed: true,
							items: [
								{
									autogenerate: {
										directory: 'devops/ansible',
									},
								},
							],
						},

						{
							label: 'Jenkins',
							collapsed: true,
							items: [
								{
									autogenerate: {
										directory: 'devops/jenkins',
									},
								},
							],
						},

						{
							label: 'GitHub Actions',
							collapsed: true,
							items: [
								{
									autogenerate: {
										directory: 'devops/github-actions',
									},
								},
							],
						},

						{
							label: 'ArgoCD',
							collapsed: true,
							items: [
								{
									autogenerate: {
										directory: 'devops/argocd',
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

				// =========================
				// SQL
				// =========================
				{
					label: 'SQL',
					collapsed: true,
					items: [
						{
							autogenerate: {
								directory: 'sql',
							},
						},
					],
				},

				// =========================
				// Veeam
				// =========================
				{
					label: 'Veeam',
					collapsed: true,
					items: [
						{
							autogenerate: {
								directory: 'veeam',
							},
						},
					],
				},

				// =========================
				// Bash
				// =========================
				{
					label: 'Bash',
					collapsed: true,
					items: [
						{
							autogenerate: {
								directory: 'Bash',
							},
						},
					],
				},
			],
		}),
	],
});
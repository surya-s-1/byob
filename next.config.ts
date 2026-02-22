import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	devIndicators: false,
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '*.com',
			},
			{
				protocol: 'https',
				hostname: '*.in',
			},
			{
				protocol: 'https',
				hostname: '*.net',
			},
			{
				protocol: 'https',
				hostname: '*.io',
			},
			{
				protocol: 'https',
				hostname: '*.org',
			}
		],
	},
}

export default nextConfig

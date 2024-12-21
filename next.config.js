const { withNextVideo } = require('next-video/process')

const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
})

const createNextIntlPlugin = require('next-intl/plugin');
 
const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    sassOptions: {
        additionalData: `@import "src/styles/_mixins.scss"; @import "src/styles/_fonts.scss";  @import "src/styles/_media.scss";`
    },
    logging: {
        fetches: {
            fullUrl: true
        }
    },
    webpack(config) {
        config.externals = [...config.externals, { canvas: 'canvas' }, "jsdom"]; // required to make Konva & react-konva work

        config.resolve.fallback = {
            ...config.resolve.fallback,
            canvas: false,
        };
        // Grab the existing rule that handles SVG imports
        const fileLoaderRule = config.module.rules.find((rule) =>
            rule.test?.test?.('.svg'),
        )

        config.module.rules.push(
        // Reapply the existing rule, but only for svg imports ending in ?url
        {
            ...fileLoaderRule,
            test: /\.svg$/i,
            resourceQuery: /url/, // *.svg?url
        },
        // Convert all other *.svg imports to React components
        {
            test: /\.svg$/i,
            issuer: fileLoaderRule.issuer,
            resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
            use: ['@svgr/webpack'],
        },
        )

        // Modify the file loader rule to ignore *.svg, since we have it handled now.
        fileLoaderRule.exclude = /\.svg$/i

        return config
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.vercel.app',
            },
            {
                protocol: 'https',
                hostname: 'img.clerk.com',
            },
            {
                protocol: 'https',
                hostname: '**.public.blob.vercel-storage.com',
            }
        ],
    }
}

module.exports = withNextVideo(withNextIntl(withBundleAnalyzer(nextConfig)), {
    provider: "vercel-blob"
});
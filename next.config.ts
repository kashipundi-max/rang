import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Lets a second `next dev` run beside another one (each needs its own lock).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  reactStrictMode: true,
  experimental: {
    // These are barrel packages: `import { siVisa } from "simple-icons"` pulls
    // the whole index in unless the import is rewritten to the concrete module.
    // simple-icons and @tabler/icons-react each carry thousands of icons, and
    // the landing page touches both (payment marquee, section icons).
    optimizePackageImports: [
      "simple-icons",
      "@tabler/icons-react",
      "framer-motion",
      "recharts",
    ],
  },
  compress: true,
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ['image/avif', 'image/webp'] as const,
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment' as const,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // help.range4ex.com is a Vercel domain pointed at this project. Every request
  // for that host is transparently proxied to the hosted Help Center so the
  // branded subdomain stays in the address bar (the upstream page carries its
  // own rel="canonical" back to chat-system-wabd.vercel.app for SEO).
  rewrites: async () => ({
    beforeFiles: [
      {
        source: '/',
        has: [{ type: 'host', value: 'help.range4ex.com' }],
        destination: 'https://chat-system-wabd.vercel.app/help/range4ex',
      },
      {
        // assets, deep links and any sub-resource the Help Center loads
        source: '/:path+',
        has: [{ type: 'host', value: 'help.range4ex.com' }],
        destination: 'https://chat-system-wabd.vercel.app/:path+',
      },
    ],
    afterFiles: [],
    fallback: [],
  }),
  headers: async () => [
    {
      source: '/font/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
    {
      source: '/images/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
  ],
  webpack(config: any) {
    const fileLoaderRule = config.module.rules.find((rule: any) =>
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

    return config;
  }
};

export default withNextIntl(nextConfig);
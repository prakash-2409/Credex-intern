/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  compress: true,
  headers: async () => [
    {
      source: "/api/og",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=3600, s-maxage=86400",
        },
      ],
    },
    {
      source: "/audit/:id/opengraph-image",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=3600, s-maxage=86400",
        },
      ],
    },
  ],
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 5,
  },
};

export default nextConfig;
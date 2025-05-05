/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      net: false,
      tls: false,
      dns: false,
      fs: false,
      child_process: false,
    }
    return config
  },

  env: {
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
  },

  reactStrictMode: true,
  compress: true,
  productionBrowserSourceMaps: false,

  images: {
    domains: [],
    formats: ["image/webp"],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  experimental: {
    forceSwcTransforms: true,
    serverActions: {
      bodySizeLimit: '10mb'
    },
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  staticPageGenerationTimeout: 60,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/api/demandes/ajouter",
        headers: [
          { 
            key: "Access-Control-Allow-Origin", 
            value: "*" 
          },
          { 
            key: "Access-Control-Allow-Methods", 
            value: "POST, OPTIONS" 
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig;

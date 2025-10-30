/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Vercel deployment configuration (no static export for server-side features)
  // Remove static export for Vercel as we need API routes and server-side features

  // Disable static optimization for pages that use dynamic features
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
      },
      {
        protocol: 'https',
        hostname: 'cdn.icon-icons.com',
      },
      {
        protocol: 'https',
        hostname: 'mistral.ai',
      },
      {
        protocol: 'https',
        hostname: 'huggingface.co',
      },
      {
        protocol: 'https',
        hostname: 'cdn.worldvectorlogo.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'graph.microsoft.com',
      }
    ]
  },

  // Add transpilePackages to help with compatibility
  transpilePackages: ['react-icons', 'framer-motion'],

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['react-icons'],
    serverComponentsExternalPackages: ['argon2']
  },

  // Configure webpack for better builds
  webpack: (config, { isServer }) => {
    // Handle argon2 for server-side only
    if (isServer) {
      config.externals.push('argon2');
    }

    // Handle file loading
    config.module.rules.push({
      test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 100000,
          name: '[name].[ext]',
        },
      },
    });

    return config;
  },

  // Environment variables for build time
  env: {
    CUSTOM_KEY: 'anoki-app',
  }
}

module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Conditionally enable static export only for production builds
  ...(process.env.NODE_ENV === 'production' && process.env.STATIC_EXPORT === 'true' ? {
    output: 'export',
    distDir: 'out',
  } : {}),
  trailingSlash: true, // Add trailing slashes to all routes
  images: {
    unoptimized: true,
    domains: [
      'upload.wikimedia.org',
      'lh3.googleusercontent.com',
      'images.ctfassets.net',
      'cdn.icon-icons.com',
      'mistral.ai',
      'huggingface.co',
      'cdn.worldvectorlogo.com'
    ]
  },
  // Add transpilePackages to help with compatibility
  transpilePackages: ['react-icons', 'framer-motion'],
  // Disable barrel optimization for react-icons
  experimental: {
    optimizePackageImports: []
  },
  // Update basePath and assetPrefix configuration for GitHub Pages
  basePath: process.env.NODE_ENV === 'production' ? '/Encode-25' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/Encode-25' : '',
  // Configure webpack to handle static assets
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 100000,
          name: '[name].[ext]',
          publicPath: `${process.env.NODE_ENV === 'production' ? '/Encode-25' : ''}/`,
        },
      },
    });
    return config;
  }
}

module.exports = nextConfig

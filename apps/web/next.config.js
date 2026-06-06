/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ['src']
  },
  experimental: {
    // Enable transpilation of shared packages
    transpilePackages: ['@sweepstake/shared']
  },
  // Ensure proper handling of workspace dependencies
  webpack: (config) => {
    // Handle workspace packages properly
    config.resolve.symlinks = false;
    return config;
  }
};

module.exports = nextConfig;
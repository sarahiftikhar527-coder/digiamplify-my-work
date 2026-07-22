import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/about',
        destination: '/pages/about',
      },
      {
        source: '/blog',
        destination: '/pages/blog',
      },
      {
        source: '/contact',
        destination: '/pages/contact',
      },
      {
        source: '/projects',
        destination: '/pages/projects',
      },
      {
        source: '/services',
        destination: '/pages/services',
      },
    ];
  },
};

export default nextConfig;

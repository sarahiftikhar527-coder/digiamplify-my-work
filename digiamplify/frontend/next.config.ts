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
      {
        source: '/login',
        destination: '/pages/login',
      },
      {
        source: '/signup',
        destination: '/pages/signup',
      },
      {
        source: '/portal/dashboard',
        destination: '/pages/portal/dashboard',
      },
      {
        source: '/portal/profile',
        destination: '/pages/portal/profile',
      },
      {
        source: '/admin/dashboard',
        destination: '/pages/portal/dashboard',
      },
      {
        source: '/admin/profile',
        destination: '/pages/portal/profile',
      },
    ];
  },
};

export default nextConfig;

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
        source: '/admin/profile/:userId',
        destination: '/pages/portal/profile?userId=:userId',
      },
      {
        source: '/admin/profile',
        destination: '/pages/portal/profile',
      },
      {
        source: '/portal/support',
        destination: '/pages/portal/support',
      },
      {
        source: '/admin/support',
        destination: '/pages/portal/support',
      },
      {
        source: '/portal/clock-in',
        destination: '/pages/portal/clock-in',
      },
      {
        source: '/admin/clock-in',
        destination: '/pages/portal/clock-in',
      },
      {
        source: '/portal/finance',
        destination: '/pages/portal/finance',
      },
      {
        source: '/admin/finance',
        destination: '/pages/portal/finance',
      },
    ];
  },
};

export default nextConfig;

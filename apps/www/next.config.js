/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["img.clerk.com"],
  },
  transpilePackages: ["@eboto-mo/db", "@eboto-mo/api"],
  experimental: {
    serverActions: true,
    swcPlugins: [["next-superjson-plugin", {}]],
  },
};

module.exports = nextConfig;

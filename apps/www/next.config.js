/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    domains: ["img.clerk.com", "api.dicebear.com"],
  },
  transpilePackages: ["@eboto-mo/db", "@eboto-mo/api"],
  experimental: {
    serverActions: true,
    swcPlugins: [["next-superjson-plugin", {}]],
  },
};

module.exports = nextConfig;

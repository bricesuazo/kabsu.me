/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@eboto-mo/db", "@eboto-mo/api", "@eboto-mo/auth"],
  experimental: {
    swcPlugins: [["next-superjson-plugin", {}]],
  },
};

module.exports = nextConfig;

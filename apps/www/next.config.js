/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  transpilePackages: ["@eboto-mo/db", "@eboto-mo/api", "@eboto-mo/auth"],
};

module.exports = nextConfig;

import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@lib": path.resolve(process.cwd(), "lib"),
    };
    return config;
  },
};

export default nextConfig;

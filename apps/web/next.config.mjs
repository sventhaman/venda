/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ichiba/schema"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;

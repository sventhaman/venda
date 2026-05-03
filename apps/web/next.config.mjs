/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@venda/schema"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;

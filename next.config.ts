import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "pub-7412235d264749c6974f82455f8bc7c1.r2.dev",
      },
    ],
  },
};

export default nextConfig;

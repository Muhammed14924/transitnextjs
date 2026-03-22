import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3.kadrigroup.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

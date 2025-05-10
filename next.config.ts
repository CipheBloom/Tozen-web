import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com', // Google
      'avatars.githubusercontent.com', // GitHub
      'platform-lookaside.fbsbx.com', // Facebook
      'pbs.twimg.com' // Twitter
    ]
  }
};

export default nextConfig;

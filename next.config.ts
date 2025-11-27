import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // experimental: {
  //   esmExternals: 'loose'
  // },
  transpilePackages: ['react-youtube'],
  reactCompiler: true,
};

export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // experimental: {
  //   esmExternals: 'loose'
  // },
  transpilePackages: ['react-youtube'],
  reactCompiler: true,
  devIndicators: {
    buildActivity: false,  // 關掉右下角的 icon
  },
};

export default nextConfig;
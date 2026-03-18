import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages (project site): https://lifeofunder.github.io/CoffeRoom/
  output: "export",
  basePath: "/CoffeRoom",
  assetPrefix: "/CoffeRoom/",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

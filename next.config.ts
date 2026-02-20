import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export", // Use export for static site generation like GitHub Pages
  images: {
    unoptimized: true, // Required for GitHub Pages
  },
};

export default nextConfig;

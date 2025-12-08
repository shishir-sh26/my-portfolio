import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Crucial for GitHub Pages: Tells Next.js to generate static HTML files
  output: 'export', 
  
  // 2. Base path must match your GitHub repository name
  // Your site URL will be https://shishir-sh26.github.io/my-portfolio/
  basePath: '/my-portfolio', 
  
  // 3. Recommended for static export: Prevents build errors related to
  // the Next.js image optimization server, which GitHub Pages cannot run.
  images: {
    unoptimized: true, 
  },

  // You can add other configurations here if needed
};

export default nextConfig;
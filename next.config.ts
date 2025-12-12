import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // 1. Crucial for static export: Tells Next.js to generate static HTML files
    output: 'export', 
    
    // 2. IMPORTANT: Remove the basePath property
    // basePath: '/my-portfolio', // <-- REMOVE THIS LINE
    
    // 3. Recommended for static export: Disables Next.js image optimization features
    images: {
        unoptimized: true, 
    },
};

export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: ".next-gala",
  allowedDevOrigins: ["*.devtunnels.ms"],
  serverExternalPackages: ["sequelize", "pg"],
};

export default nextConfig;

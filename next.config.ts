import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: ".next-gala",
  allowedDevOrigins: ["*.devtunnels.ms"],
  serverExternalPackages: ["sequelize", "mysql2"],
};

export default nextConfig;

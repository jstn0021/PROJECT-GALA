import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.devtunnels.ms"],
  serverExternalPackages: ["sequelize", "pg"],
};

export default nextConfig;

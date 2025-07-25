/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://apialfa.apoint.uz/v1",
    USE_MOCK_DATA: process.env.NEXT_PUBLIC_USE_MOCK_DATA || "true",
  },
};

export default nextConfig;

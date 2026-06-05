/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NVR_PUBLIC_IP: process.env.NVR_PUBLIC_IP,
    NVR_PUBLIC_PORT: process.env.NVR_PUBLIC_PORT,
    NVR_USER: process.env.NVR_USER,
    NVR_PASS: process.env.NVR_PASS,
  },
}

module.exports = nextConfig

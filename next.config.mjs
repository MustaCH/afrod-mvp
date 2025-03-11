/** @type {import('next').NextConfig} */
const nextConfig = {
  api: {
    bodyParser: {
      sizeLimit: "50mb", // Aumenta según necesites (ej: 100mb, 200mb)
    },
  },
};

export default nextConfig;

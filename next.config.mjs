/** @type {import('next').NextConfig} */
const nextConfig = {
  api: {
    bodyParser: {
      sizeLimit: "50mb", // Ajusta según tus necesidades (ej: 100mb, 200mb)
    },
  },
};

export default nextConfig;

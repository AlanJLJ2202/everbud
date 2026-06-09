/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'icxeyvjrxgjdgokftkfu.supabase.co',
      },
    ],
  },
};

export default nextConfig;

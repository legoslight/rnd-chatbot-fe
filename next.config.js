/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    URL_API_CHAT_BOT: process.env.URL_API_CHAT_BOT,
    URL_API: process.env.URL_API,
  },
};

module.exports = nextConfig;

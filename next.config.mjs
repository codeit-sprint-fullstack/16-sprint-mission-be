const nextConfig = {
  async rewrites() {
    const apiBaseUrl = (process.env.API_BASE_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");
    return [{ source: "/api/:path*", destination: `${apiBaseUrl}/:path*` }];
  },
};

export default nextConfig;

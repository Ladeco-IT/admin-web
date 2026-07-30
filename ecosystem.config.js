module.exports = {
  apps: [
    {
      name: "ladeco-it-admin",
      script: "./node_modules/next/dist/bin/next",
      args: "start",
      cwd: "C:\\inetpub\\admin-web",
      env: {
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
        NODE_ENV: "production"
      }
    }
  ]
};
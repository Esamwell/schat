module.exports = [
  {
    script: "dist/server.js",
    name: "izing-backend",
    exec_mode: "cluster",
    instances: 1,
    watch: false
  }
];

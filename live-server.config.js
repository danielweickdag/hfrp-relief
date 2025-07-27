module.exports = {
  port: 5000,
  host: "localhost",
  root: "./out", // For Next.js static export
  open: false,
  ignore: 'scss,my/templates',
  file: "index.html",
  wait: 1000,
  mount: [['/components', './path/to/components']],
  logLevel: 2,
  middleware: [
    function(req, res, next) {
      // Add CORS headers for development
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      next();
    }
  ]
};

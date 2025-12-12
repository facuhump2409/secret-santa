const app = require('../server');

// Export as Vercel serverless function
module.exports = (req, res) => {
  return app(req, res);
};


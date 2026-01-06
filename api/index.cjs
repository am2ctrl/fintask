// Vercel Serverless Function Handler
// This file imports the Express handler from the built server

const path = require('path');

try {
  // Import the built server handler
  const serverPath = path.join(__dirname, '..', 'dist', 'index.cjs');
  console.log('[api/index.js] Loading server from:', serverPath);

  const handler = require(serverPath);

  console.log('[api/index.js] Handler loaded successfully, type:', typeof handler);

  // Export the handler for Vercel
  module.exports = handler;
} catch (error) {
  console.error('[api/index.js] Failed to load handler:', error);

  // Export error handler
  module.exports = async (req, res) => {
    console.error('[api/index.js] Error handler called');
    res.status(500).json({
      error: 'Server initialization failed',
      message: error.message,
      stack: error.stack
    });
  };
}

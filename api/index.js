// Vercel Serverless Function Handler
// This file imports the Express handler from the built server
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

let handler;
let loadError;

try {
  // Import the built server handler
  const serverPath = join(__dirname, '..', 'dist', 'index.cjs');
  console.log('[api/index.js] Loading server from:', serverPath);

  handler = require(serverPath);

  console.log('[api/index.js] Handler loaded successfully, type:', typeof handler);
} catch (error) {
  console.error('[api/index.js] Failed to load handler:', error);
  loadError = error;
}

// Export the handler for Vercel
export default async (req, res) => {
  if (loadError) {
    console.error('[api/index.js] Handler load error:', loadError);
    return res.status(500).json({
      error: 'Server initialization failed during load',
      message: loadError.message,
      stack: loadError.stack
    });
  }

  if (!handler) {
    console.error('[api/index.js] Handler is null/undefined');
    return res.status(500).json({
      error: 'Handler not initialized'
    });
  }

  try {
    console.log('[api/index.js] Calling handler for:', req.url);
    return await handler(req, res);
  } catch (error) {
    console.error('[api/index.js] Handler execution error:', error);
    return res.status(500).json({
      error: 'Handler execution failed',
      message: error.message,
      stack: error.stack
    });
  }
};

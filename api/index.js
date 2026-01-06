// Vercel Serverless Function Handler
// This file imports the Express handler from the built server
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

let handler;

try {
  // Import the built server handler
  const serverPath = join(__dirname, '..', 'dist', 'index.cjs');
  console.log('[api/index.js] Loading server from:', serverPath);

  handler = require(serverPath);

  console.log('[api/index.js] Handler loaded successfully, type:', typeof handler);
} catch (error) {
  console.error('[api/index.js] Failed to load handler:', error);

  // Create error handler
  handler = async (req, res) => {
    console.error('[api/index.js] Error handler called');
    res.status(500).json({
      error: 'Server initialization failed',
      message: error.message,
      stack: error.stack
    });
  };
}

// Export the handler for Vercel
export default handler;

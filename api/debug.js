// Debug endpoint
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

export default async (req, res) => {
  try {
    const serverPath = join(__dirname, '..', 'dist', 'index.cjs');
    const handler = require(serverPath);
    
    res.status(200).json({
      success: true,
      handler_type: typeof handler,
      message: 'Handler loaded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
      name: error.name
    });
  }
};
